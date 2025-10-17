import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, expandedJsonLettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepths } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAllNoHoisted } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { getMaxScope } from "./groupByScope";
import { lettedToStr, prettyIRInline, prettyIRText } from "../../../utils/showIR";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { lowestCommonAncestor } from "../../_internal/lowestCommonAncestor";
import { isIRTerm } from "../../../utils/isIRTerm";
import { markRecursiveHoistsAsForced } from "../markRecursiveHoistsAsForced";
import { IRConst } from "../../../IRNodes/IRConst";
import { equalIrHash, irHashToHex } from "../../../IRHash";
import { sanifyTree } from "../sanifyTree";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { findHighestRecursiveParent } from "./findHighestRecursiveParent";
import { IRParentTerm } from "../../../utils/isIRParentTerm";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { isClosedTerm } from "@harmoniclabs/uplc";

export function handleLettedAndReturnRoot( term: IRTerm ): IRTerm
{
    // console.log(" ------------------------------------------- handleLetted ------------------------------------------- ");
    // console.log( prettyIRText( term ))
    // most of the time we are just compiling small
    // pre-execuded terms (hence constants)
    if( term instanceof IRConst ) return term;

    sanifyTree( term );
    
    // TODO: should probably merge `markRecursiveHoistsAsForced` inside `getLettedTerms` to iter once
    markRecursiveHoistsAsForced( term );

    // in case there are no letted terms there is no work to do
    while( true )
    {
        // console.log(` ------------------ letted loop ------------------ `);

        const allDirectLetted = getLettedTerms( term, { all: false, includeHoisted: false });
        if( allDirectLetted.length === 0 ) return term;

        // // console.log("allDirectLetted", allDirectLetted.map( expandedJsonLettedSetEntry ) );
        
        const sortedLettedSet = getSortedLettedSet( allDirectLetted );

        // console.log("sortedLettedSet", sortedLettedSet.map( expandedJsonLettedSetEntry ) );

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

        // shouldLog && // console.log("nReferences", nReferences);

        // console.log(` ------------------ working with ${lettedToStr(letted)} ------------------ `);
        if( nReferences === 1 )
        {
            // console.log("inlining letted (single reference) with value", prettyIRText( letted.value ) )
            _modifyChildFromTo(
                letted.parent,
                letted,
                letted.value
            );
            continue;
        }

        // console.log("--------- not inilning ("+ nReferences +" references)");

        const maxScope = getMaxScope( letted ) ?? term;
        // const maxScope = getMaxScope( letted ) ?? ((): IRTerm => {
        //     if( letted.meta.isClosed || isClosedTerm( letted.value ) )
        //     {
        //         // value is closed (hoisted),
        //         // so the max scope is the entire script
        //         return term;
        //     }
        //     else throw new Error(
        //         `could not find a max scope for letted value with hash ${irHashToHex(letted.hash)}`
        //     );
        // })();

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

        // console.log("sameLettedRefs", sameLettedRefs.length );

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
            // console.log("inlining letted (single reference pedantic) with value", prettyIRText( letted.value ) )
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
            // console.log("inlining letted (value is var) with value", prettyIRText( letted.value ) )
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

        const parentNode: IRTerm = lca;
        const parentNodeDirectChild = (
            parentNode instanceof IRFunc ||
            parentNode instanceof IRRecursive
        ) ? parentNode.body : parentNode.delayed;

        // now we replace
        const lettedValue = letted.value.clone();

        const newNode = new IRApp(
            new IRFunc(
                [ letted.name ],
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
                new IRVar( ref.name )
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
        // // // console.log("final max scope (delayed: " + delayed + ")" , prettyIRText( finalMaxScope ) )
    }
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

    // now we replace
    const lettedValue = letted.value; //.clone();

    // no need to modify letted value dbns, since closed
    // modifyValueToLetDbns( lettedValue, getDiffDbn( letted, parentNode ) );

    const newNode = new IRApp(
        new IRFunc(
            [ letted.name ],
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
            new IRVar( ref.name )
        );
    }

    return currentRoot;
}