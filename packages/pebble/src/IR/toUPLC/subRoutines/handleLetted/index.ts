import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, expandedJsonLettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepths } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAllNoHoisted } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { _getMinUnboundDbn } from "./groupByScope";
import { lettedToStr, onlyHoistedAndLetted, prettyIR, prettyIRInline, prettyIRJsonStr, prettyIRText } from "../../../utils/showIR";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { lowestCommonAncestor } from "../../_internal/lowestCommonAncestor";
import { isIRTerm } from "../../../utils/isIRTerm";
import { markRecursiveHoistsAsForced } from "../markRecursiveHoistsAsForced";
import { IRConst } from "../../../IRNodes/IRConst";
import { incrementUnboundDbns } from "./incrementUnboundDbns";
import { equalIrHash, IRHash, irHashToHex } from "../../../IRHash";
import { sanifyTree } from "../sanifyTree";
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRCase } from "../../../IRNodes/IRCase";
import { IRConstr } from "../../../IRNodes/IRConstr";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { findHighestRecursiveParent } from "./findHighestRecursiveParent";
import { IRParentTerm } from "../../../utils/isIRParentTerm";
import { fromHex } from "@harmoniclabs/uint8array-utils";
import { iterTree } from "../../_internal/iterTree";
import { IRHoisted } from "../../../IRNodes/IRHoisted";

export function handleLettedAndReturnRoot( term: IRTerm ): IRTerm
{
    console.log(" ------------------------------------------- handleLetted ------------------------------------------- ");
    console.log( prettyIRText( term ))
    // most of the time we are just compiling small
    // pre-execuded terms (hence constants)
    if( term instanceof IRConst ) return term;

    sanifyTree( term );
    
    // TODO: should probably merge `markRecursiveHoistsAsForced` inside `getLettedTerms` to iter once
    markRecursiveHoistsAsForced( term );

    // in case there are no letted terms there is no work to do
    while( true )
    {
        console.log(` ------------------ letted loop ------------------ `);

        const allDirectLetted = getLettedTerms( term, { all: false, includeHoisted: false });
        if( allDirectLetted.length === 0 ) return term;

        // console.log("allDirectLetted", allDirectLetted.map( expandedJsonLettedSetEntry ) );
        
        const sortedLettedSet = getSortedLettedSet( allDirectLetted );

        console.log("sortedLettedSet", sortedLettedSet.map( expandedJsonLettedSetEntry ) );

        // `sortedLettedSet` is sorted from least to most dependencies
        // so we'll have "0 dependencies" letted terms at the start of the array
        // and "n dependencies" letted terms at the end of the array
        // 
        // we process the "most dependent" terms first
        // so their values are inlined
        // and later, its dependencies will be replaced with `IRVar`
        // whereever these dependent are inlined
        //
        // hence why `pop` (and not `shift`)
        const {
            letted,
            nReferences
        } = sortedLettedSet.pop()!;

        // shouldLog && console.log("nReferences", nReferences);

        console.log(` ------------------ working with ${lettedToStr(letted)} ------------------ `);
        if( nReferences === 1 )
        {
            console.log("inlining letted (single reference) with value", prettyIRText( letted.value ) )
            _modifyChildFromTo(
                letted.parent,
                letted,
                letted.value
            );
            continue;
        }

        console.log("--------- not inilning ("+ nReferences +" references)");

        const maxScope = findLettedMaxScope( letted ) ?? ((): IRTerm => {
            if( letted.meta.isClosed || letted.isClosedAtDbn( 0 ) )
            {
                // value is closed (hoisted),
                // so the max scope is the entire script
                return term;
            }
            else throw new Error(
                `could not find a max scope for letted value with hash ${irHashToHex(letted.hash)}`
            );
        })();

        const lettedTermCanBeHoisted = maxScope === term;

        const minScope = findHighestRecursiveParent( letted, maxScope );
        
        sanifyTree( maxScope );
        const lettedHash = letted.hash;

        const sameLettedRefs = findAllNoHoisted(
            maxScope,
            node => 
                node instanceof IRLetted &&
                equalIrHash( node.hash, lettedHash )
        ) as IRLetted[];

        console.log("sameLettedRefs", sameLettedRefs.length );

        if( sameLettedRefs.length <= 0 ) {
            console.warn(
                "how did you get here? 0 references found for letted term;\n" +
                "the compiler can easly recover this edge case, but something funny is going on with this contract.\n\n"+
                "!!! PLEASE OPEN AN ISSUE ON GITHUB (https://github.com/HarmonicLabs/plu-ts/issues) !!!\n"
            );
            continue;
        }

        // just in case
        if( sameLettedRefs.length === 1 && !minScope )
        {
            console.log("inlining letted (single reference pedantic) with value", prettyIRText( letted.value ) )
            _modifyChildFromTo(
                letted.parent,
                letted,
                letted.value
            );
            continue;
        }

        // always inline letted vars
        if(
            letted.value instanceof IRVar ||
            letted.value instanceof IRSelfCall
        ) {
            console.log("inlining letted (value is var) with value", prettyIRText( letted.value ) )
            for( const elem of sameLettedRefs )
            {
                // inline
                _modifyChildFromTo(
                    elem.parent,
                    elem,
                    elem.value
                );
            }
            continue;
        }

        let lca: IRTerm | undefined = minScope ?? sameLettedRefs[0];
        
        // const forceHoist = false && sameLettedRefs.some( letted => letted.meta.forceHoist === true );
    
        for( let j = 1; j < sameLettedRefs.length; j++ )
        {
            const prevLca: IRTerm = lca; 
            lca = lowestCommonAncestor( lca, sameLettedRefs[j], maxScope );
            if( !isIRTerm( lca ) )
            {
                lca = prevLca;
            };
        }

        if( !isIRTerm( lca ) )
        {
            throw new Error(
                "letting nodes with hash " + irHashToHex( lettedHash ) + " from different trees"
            );
        }

        const realLca = lca;

        // point to the first func or delay node above the lca
        // (worst case scenario we hit the maxScope; which is an IRFunc)
        // IRFuncs should always be under IRRecursives if any
        while(!(
            lca instanceof IRFunc ||
            lca instanceof IRDelayed
        ) && lca )
        {
            lca = lca?.parent ?? undefined;
        }


        if( !isIRTerm( lca ) )
        {
            if( !lettedTermCanBeHoisted )
            throw new Error(
                "lowest common ancestor outside the max scope"
            );

            lca = realLca;
            const tmpRoot = handleLettedAsHoistedAndReturnRoot(
                letted,
                realLca, // lca
                sameLettedRefs,
                term
            );

            if( lca === maxScope || !lca.parent ) term = tmpRoot;
            
            continue;
        }

        console.log("hello", (lettedHash + 1 + Number.MAX_SAFE_INTEGER).toString(16));

        const parentNode: IRTerm = lca;
        const parentNodeDirectChild = (
            parentNode instanceof IRFunc ||
            parentNode instanceof IRRecursive
        ) ? parentNode.body : parentNode.delayed;

        // let irJson = prettyIR( term );
        console.log("before increment",
            prettyIRInline( term )
        );

        // add 1 to every var's DeBruijn that accesses stuff outside the parent node
        // not including the `parentNode` node
        // since the new function introdcued substituting the letted term
        // is added inside the `parentNode` node
        incrementUnboundDbns(
            parentNodeDirectChild,
            // `shouldNotModifyLetted` arg (given the hash returns `true` if it should NOT modify the term)
            // this callback is ONLY called on LETTED terms
            ({ hash }) => equalIrHash( hash, lettedHash )
        );

        // irJson = prettyIR( term );
        console.log("after increment",
            prettyIRInline( term )
        );
        
        // now we replace
        const lettedValue = letted.value.clone();

        modifyValueToLetDbns( lettedValue, getDiffDbn( letted, parentNode ) );

        const newNode = new IRApp(
            new IRFunc(
                1,
                parentNodeDirectChild
            ),
            lettedValue,
            { __src__ : letted.meta.__src__ }
        );

        // replace child with new node
        if( parentNode instanceof IRFunc || parentNode instanceof IRRecursive ) parentNode.body = newNode;
        else parentNode.delayed = newNode;

        for( const ref of sameLettedRefs )
        {
            _modifyChildFromTo(
                ref.parent,
                ref,
                new IRVar( getDebruijnInTerm( parentNodeDirectChild, ref ) )
            );
        }

        // const delayed = parentNode instanceof IRDelayed;
        // let finalMaxScope: IRFunc | IRDelayed = parentNode;
        // while(!(
        //     finalMaxScope instanceof IRFunc ||
        //     finalMaxScope instanceof IRDelayed
        // ))
        // {
        //     finalMaxScope = (finalMaxScope as any).parent as any
        // }
        // // console.log("final max scope (delayed: " + delayed + ")" , prettyIRText( finalMaxScope ) )
    }
}

/**
 * 
 * @param letted 
 * @returns {IRFunc} the lowest `IRFunc` in the tree that defines all the variables needed for the 
 */
function findLettedMaxScope( letted: IRLetted ): IRTerm | undefined
{
    let minUnboundDbn = _getMinUnboundDbn( letted.value );
    if( minUnboundDbn === undefined )
    {
        let tmp: IRTerm | IRDelayed = letted;
        let maxScope: IRTerm | undefined = undefined;
        while( tmp.parent )
        {
            tmp = tmp.parent;
            if( tmp instanceof IRFunc || tmp instanceof IRDelayed ) maxScope = tmp;
        };
        return maxScope;
    }

    let tmp: IRTerm = letted;
    let maxScope: IRFunc | undefined = undefined;

    while( minUnboundDbn >= 0 )
    {
        if( !tmp.parent )
        {
            throw new Error(
                `could not find a max scope for letted value with hash ${irHashToHex(letted.hash)}; `+
                `the max parent found leaves the term open (reached root)`
            );
        }
        tmp = tmp.parent;
        if( tmp instanceof IRRecursive )
        {
            minUnboundDbn -= tmp.arity;
            // maxScope = tmp; // recursive cannot be a max scope
        }
        else if( tmp instanceof IRFunc )
        {
            minUnboundDbn -= tmp.arity;
            maxScope = tmp;
        }
    }

    // just ts sillyness here
    if( !maxScope )
    {
        throw new Error(
            `could not find a max scope for letted value with hash ${irHashToHex(letted.hash)}; `+
            `no IRFunc found`
        );
    }

    return maxScope;

}

function modifyValueToLetDbns( lettedValue: IRTerm, diffDbn: number ): void
{
    if( diffDbn <= 0 ) return;

    // if there is any actual difference between the letted term
    // and the position where it will be finally placed
    // the value needs to be modified accoridingly
    const stack: { term: IRTerm, dbn: number }[] = [{ term: lettedValue, dbn: 0 }];

    while( stack.length > 0 )
    {
        const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if((
            t instanceof IRVar ||
            t instanceof IRSelfCall
        ) && t.dbn > dbn ) {
            t.dbn -= diffDbn;
        }

        if( t instanceof IRLetted )
        {
            t.dbn -= diffDbn;
            // reduce dbn in letted value too
            stack.push({ term: t.value, dbn });
            continue;
        }
        
        if(
            t instanceof IRFunc
            || t instanceof IRRecursive
        ) {
            // new variable in scope
            stack.push({ term: t.body, dbn: dbn + t.arity });
            continue;
        }

        if( t instanceof IRHoisted ) { continue; } // skip hoisted since closed

        stack.push(
            ...t.children().map( term => ({ term, dbn }) )
        );
    }
}

/**
 * @returns the difference in DeBruijn
 * between the maxScope and the letted term
 */
function getDiffDbn( letted: IRLetted, parentNode: IRTerm ): number
{
    // get the difference in DeBruijn
    // between the maxScope and the letted term
    let diffDbn = 0;
    //*
    let tmpNode: IRTerm = letted;
    while( tmpNode !== parentNode )
    {
        tmpNode = tmpNode.parent as any;
        if( // is an intermediate `IRFunc`
            (
                tmpNode instanceof IRFunc ||
                tmpNode instanceof IRRecursive
            ) && 
            tmpNode !== parentNode // avoid counting parent node arity if IRFunc 
        )
        {
            // increment differential in DeBruijn by n vars indroduced here
            diffDbn += tmpNode.arity;
        }
    }
    return diffDbn;
}

function handleLettedAsHoistedAndReturnRoot(
    letted: IRLetted,
    lca: IRTerm,
    sameLettedRefs: IRLetted[],
    currentRoot: IRTerm
): IRTerm
{
    const lettedHash = letted.hash;
    let parentNode: IRParentTerm | undefined = lca.parent;
    const parentNodeDirectChild = lca;

    // add 1 to every var's DeBruijn that accesses stuff outside the parent node
    // not including the `parentNode` node
    // since the new function introdcued substituting the letted term
    // is added inside the `parentNode` node
    incrementUnboundDbns(
        parentNodeDirectChild,
        // `shouldNotModifyLetted` arg (given the hash returns `true` if it should NOT modify the term)
        ({ hash }) => equalIrHash( hash, lettedHash )
    );
    
    // now we replace
    const lettedValue = letted.value; //.clone();

    // no need to modify letted value dbns, since closed
    // modifyValueToLetDbns( lettedValue, getDiffDbn( letted, parentNode ) );

    const newNode = new IRApp(
        new IRFunc(
            1,
            parentNodeDirectChild
        ),
        lettedValue,
        { __src__ : letted.meta.__src__ }
    );

    // replace child with new node
    if( parentNode )
    {
        _modifyChildFromTo(
            parentNode,
            parentNodeDirectChild,
            newNode
        );
    }
    else
    {
        currentRoot = newNode;
    }

    for( const ref of sameLettedRefs )
    {
        _modifyChildFromTo(
            ref.parent,
            ref,
            new IRVar( getDebruijnInTerm( parentNodeDirectChild, ref ) )
        );
    }

    return currentRoot;
}