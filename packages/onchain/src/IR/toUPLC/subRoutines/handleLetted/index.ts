import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, jsonLettedSetEntry, expandedJsonLettedSetEntry, LettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepths } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAll, findAllNoHoisted } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { _getMinUnboundDbn, groupByScope } from "./groupByScope";
import { lettedToStr, prettyIR, prettyIRJsonStr, prettyIRText, showIR } from "../../../utils/showIR";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { lowestCommonAncestor } from "../../_internal/lowestCommonAncestor";
import { isIRTerm } from "../../../utils/isIRTerm";
import { markRecursiveHoistsAsForced } from "../markRecursiveHoistsAsForced";
import { IRConst } from "../../../IRNodes/IRConst";
import { incrementUnboundDbns } from "./incrementUnboundDbns";
import { equalIrHash, irHashToHex } from "../../../IRHash";
import { sanifyTree } from "../sanifyTree";
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRCase } from "../../../IRNodes/IRCase";
import { IRConstr } from "../../../IRNodes/IRConstr";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { IRRecursive } from "../../../IRNodes/IRRecursive";


function onlyLettedTerm( setEntry: LettedSetEntry ): IRLetted
{
    return setEntry.letted;
}

export function _handleLetted( term: IRTerm ): void
{
    // most of the time we are just compiling small
    // pre-execuded terms (hence constants)
    if( term instanceof IRConst ) return;
    
    // TODO: should probably merge `markRecursiveHoistsAsForced` inside `getLettedTerms` to iter once
    markRecursiveHoistsAsForced( term );

    const allDirectLetted = getLettedTerms( term, { all: false, includeHoisted: false });

    // in case there are no letted terms there is no work to do
    if( allDirectLetted.length === 0 ) return;

    const allLettedRefs = getLettedTerms( term, { all: true, includeHoisted: false }).map( onlyLettedTerm );
    const sortedLettedSet = getSortedLettedSet( allDirectLetted );

    const allScopes: {
        maxScope: IRFunc,
        lettedRefs: IRLetted[],
        forceHoist: boolean
    }[] = sortedLettedSet.map(({ letted }) => {

        const theHash = letted.hash;
        const allSameLetted = allLettedRefs.filter(({ hash }) => equalIrHash( hash, theHash ) );

        const scopes = new Array<{
            maxScope: IRFunc,
            lettedRefs: IRLetted[],
            forceHoist: boolean
        }>();

        for( const letted of allSameLetted )
        {
            const _maxScope = findLettedMaxScope( letted );
            const idx = scopes.findIndex(({ maxScope }) => maxScope === _maxScope );
            if( idx < 0 )
            {
                scopes.push({
                    maxScope: _maxScope,
                    lettedRefs: [ letted ],
                    forceHoist: letted.meta.forceHoist === true
                });
            }
            else
            {
                scopes[idx].lettedRefs.push( letted );
                scopes[idx].forceHoist ||= (letted.meta.forceHoist === true);
            }
        }

        return scopes;
    }).reduce((a, b) => a.concat( b ))

    // needs to go from last to first so that letted terms' hashes will not change
    // (aka. we replace dependents before dependecies)
    while( allScopes.length > 0 )
    {
        let {
            maxScope,
            lettedRefs: sameLettedRefs,
            forceHoist
        } = allScopes.pop()!;

        // const maxScope = findLettedMaxScope( lettedExampleElem );
        const setLettedHash = sameLettedRefs[0].hash;

        const lettedExampleElem = sameLettedRefs[0];

        if( !lettedExampleElem ) continue;

        // inline single references
        if(
            !forceHoist && 
            sameLettedRefs.length <= 1
        )
        {
            _modifyChildFromTo(
                lettedExampleElem.parent,
                lettedExampleElem,
                lettedExampleElem.value
            );
            continue;
        }

        // always inline letted vars
        if( lettedExampleElem.value instanceof IRVar )
        {
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

        let lca: IRTerm | undefined = sameLettedRefs[0];

        // if `froceHoist` is true;
        // we append directly to `maxScope`
        // hence no need to look for `lca`
        if( !forceHoist )
        {
            for( let j = 1; j < sameLettedRefs.length; j++ )
            {
                lca = lowestCommonAncestor( lca, sameLettedRefs[j], maxScope );
                if( !isIRTerm( lca ) ) break;
            }
    
            if( !isIRTerm( lca ) )
            {
                // default to maxScope
                lca = maxScope;
                throw new Error(
                    "letting nodes with hash " + irHashToHex( setLettedHash ) + " from different trees"
                );
            }
            else
            {
                // point to the first func or delay node above the lca
                // (worst case scenario we hit the maxScope; which is an IRFunc)
                // IRFuncs should always be under IRRecursives if any
                while(!(
                    lca instanceof IRFunc ||
                    lca instanceof IRDelayed
                ))
                {
                    lca = lca?.parent ?? undefined;
                    // if somehow we hit the root
                    if( !isIRTerm( lca ) )
                    {
                        throw new Error(
                            "lowest common ancestor outside the max scope"
                        );
                    }
                }
            }
        }

        const parentNode: IRFunc | IRDelayed = forceHoist ? maxScope : lca as any;
        const parentNodeDirectChild = (
            parentNode instanceof IRFunc ||
            parentNode instanceof IRRecursive
        ) ? parentNode.body : parentNode.delayed;

        // add 1 to every var's DeBruijn that accesses stuff outside the parent node
        // not including the `parentNode` node
        // since the new function introdcued substituting the letted term
        // is added inside the `parentNode` node
        incrementUnboundDbns(
            parentNodeDirectChild,
            // shouldNotModifyLetted
            ({ hash }) => equalIrHash( hash, setLettedHash )
        );
        
        // get the difference in DeBruijn
        // between the maxScope and the letted term
        let diffDbn = 0; // getDiffDbn( parentNodeDirectChild, letted );
        //*
        let tmpNode: IRTerm = lettedExampleElem;
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
        //*/

        // now we replace
        const lettedValue = lettedExampleElem.value.clone();

        // if there is any actual difference between the letted term
        // and the position where it will be finally placed
        // the value needs to be modified accoridingly
        if( diffDbn > 0 )
        {
            const stack: { term: IRTerm, dbn: number }[] = [{ term: lettedValue, dbn: 0 }];

            while( stack.length > 0 )
            {
                const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

                if(
                    t instanceof IRVar &&
                    t.dbn > dbn
                )
                {
                    t.dbn -= diffDbn;
                }

                if( t instanceof IRLetted )
                {
                    t.dbn -= diffDbn;
                    // reduce dbn in letted value too
                    stack.push({ term: t.value, dbn });
                    continue;
                }
                
                if( t instanceof IRApp )
                {
                    stack.push(
                        { term: t.arg, dbn },
                        { term: t.fn, dbn  }
                    );
                    continue;
                }
                if( t instanceof IRCase )
                {
                    stack.push(
                        { term: t.constrTerm, dbn },
                        ...mapArrayLike(
                            t.continuations,
                            continuation => ({ term: continuation, dbn })
                        )
                    );
                    continue;
                }
                if( t instanceof IRConstr )
                {
                    stack.push(
                        ...mapArrayLike(
                            t.fields,
                            field => ({ term: field, dbn })
                        )
                    );
                    continue
                }

                if( t instanceof IRDelayed )
                {
                    stack.push({ term: t.delayed, dbn })
                    continue;
                }
                if( t instanceof IRForced )
                {
                    stack.push({ term: t.forced, dbn });
                    continue;
                }
                if( t instanceof IRFunc )
                {
                    stack.push({ term: t.body, dbn: dbn + t.arity });
                    continue;
                }
                if( t instanceof IRRecursive )
                {
                    stack.push({ term: t.body, dbn: dbn + t.arity });
                    continue;
                }
                // no hoisted
            }
        }

        // save parent so when replacing we don't create a circular sameLettedRefs
        const parent = parentNode;

        const newNode = new IRApp(
            new IRFunc(
                1,
                parentNodeDirectChild
            ),
            lettedValue
        );

        _modifyChildFromTo(
            parent,
            parentNodeDirectChild, // not really used since we know parent is not `IRApp`
            newNode
        );

        sameLettedRefs = findAllNoHoisted(
            parentNodeDirectChild,
            term => 
                term instanceof IRLetted &&
                (
                    sameLettedRefs.includes( term ) ||
                    sameLettedRefs.some(({ hash }) => equalIrHash( hash, setLettedHash ) )
                )
        ) as IRLetted[];

        for( const ref of sameLettedRefs )
        {
            if( isChildOf( ref, parentNodeDirectChild ) )
            {
                _modifyChildFromTo(
                    ref.parent,
                    ref,
                    new IRVar( getDebruijnInTerm( parentNodeDirectChild, ref ) )
                );
            }
        }
    }
}

export function handleLetted( term: IRTerm ): void
{
    // console.log(" ------------------------------------------- handleLetted ------------------------------------------- ");
    // console.log( prettyIRJsonStr( term ))
    // most of the time we are just compiling small
    // pre-execuded terms (hence constants)
    if( term instanceof IRConst ) return;
    
    // TODO: should probably merge `markRecursiveHoistsAsForced` inside `getLettedTerms` to iter once
    markRecursiveHoistsAsForced( term );


    // in case there are no letted terms there is no work to do
    while( true )
    {
        const allDirectLetted = getLettedTerms( term, { all: false, includeHoisted: false });
        if( allDirectLetted.length === 0 ) return;
        // console.log("found ", allDirectLetted.length, "letted terms");
    
        const sortedLettedSet = getSortedLettedSet( allDirectLetted );

        const {
            letted,
            nReferences
        } = sortedLettedSet.pop()!;

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

        const maxScope = findLettedMaxScope( letted );
        sanifyTree( maxScope );
        const lettedHash = letted.hash;

        const sameLettedRefs = findAllNoHoisted(
            maxScope,
            node => 
                node instanceof IRLetted &&
                equalIrHash( node.hash, lettedHash )
        ) as IRLetted[];

        // console.log("found ", sameLettedRefs.length, "references of the letted terms");

        if( sameLettedRefs.length <= 0 )
        {
            console.warn(
                "wtf? 0 references found for letted term;\n\n" +
                "!!! PLEASE OPEN AN ISSUE ON GITHUB (https://github.com/HarmonicLabs/plu-ts/issues) !!!\n\n"
            );
            continue;
        }

        // just in case
        if( sameLettedRefs.length === 1 )
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
        if( letted.value instanceof IRVar )
        {
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

        let lca: IRTerm | undefined = sameLettedRefs[0];
        
        const forceHoist = sameLettedRefs.some( letted => letted.meta.forceHoist === true );

        // if `froceHoist` is true;
        // we append directly to `maxScope`
        // hence no need to look for `lca`
        if( !forceHoist )
        {
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
                // default to maxScope
                // lca = maxScope;
                throw new Error(
                    "letting nodes with hash " + irHashToHex( lettedHash ) + " from different trees"
                );
            }
            else
            {
                // point to the first func or delay node above the lca
                // (worst case scenario we hit the maxScope; which is an IRFunc)
                // IRFuncs should always be under IRRecursives if any
                while(!(
                    lca instanceof IRFunc ||
                    lca instanceof IRDelayed
                ))
                {
                    lca = lca?.parent ?? undefined;
                    // if somehow we hit the root
                    if( !isIRTerm( lca ) )
                    {
                        throw new Error(
                            "lowest common ancestor outside the max scope"
                        );
                    }
                }
            }
        }

        const parentNode: IRFunc | IRDelayed = forceHoist ? maxScope : lca as any;
        const parentNodeDirectChild = (
            parentNode instanceof IRFunc ||
            parentNode instanceof IRRecursive
        ) ? parentNode.body : parentNode.delayed;

        // add 1 to every var's DeBruijn that accesses stuff outside the parent node
        // not including the `parentNode` node
        // since the new function introdcued substituting the letted term
        // is added inside the `parentNode` node
        incrementUnboundDbns(
            parentNodeDirectChild,
            // `shouldNotModifyLetted` arg (given the hash returns `true` if it should NOT modify the term)
            ({ hash }) => equalIrHash( hash, lettedHash )
        );
        
        // get the difference in DeBruijn
        // between the maxScope and the letted term
        let diffDbn = 0; // getDiffDbn( parentNodeDirectChild, letted );
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
        //*/

        // now we replace
        const lettedValue = letted.value.clone();

        // if there is any actual difference between the letted term
        // and the position where it will be finally placed
        // the value needs to be modified accoridingly
        if( diffDbn > 0 )
        {
            const stack: { term: IRTerm, dbn: number }[] = [{ term: lettedValue, dbn: 0 }];

            while( stack.length > 0 )
            {
                const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

                if(
                    t instanceof IRVar &&
                    t.dbn > dbn
                )
                {
                    t.dbn -= diffDbn;
                }

                if( t instanceof IRLetted )
                {
                    t.dbn -= diffDbn;
                    // reduce dbn in letted value too
                    stack.push({ term: t.value, dbn });
                    continue;
                }
                
                if( t instanceof IRApp )
                {
                    stack.push(
                        { term: t.arg, dbn },
                        { term: t.fn, dbn  }
                    );
                    continue;
                }
                if( t instanceof IRCase )
                {
                    stack.push(
                        { term: t.constrTerm, dbn },
                        ...mapArrayLike(
                            t.continuations,
                            continuation => ({ term: continuation, dbn })
                        )
                    );
                    continue;
                }
                if( t instanceof IRConstr )
                {
                    stack.push(
                        ...mapArrayLike(
                            t.fields,
                            field => ({ term: field, dbn })
                        )
                    );
                    continue
                }
                if( t instanceof IRDelayed )
                {
                    stack.push({ term: t.delayed, dbn })
                    continue;
                }
                if( t instanceof IRForced )
                {
                    stack.push({ term: t.forced, dbn });
                    continue;
                }
                if( t instanceof IRFunc )
                {
                    stack.push({ term: t.body, dbn: dbn + t.arity });
                    continue;
                }
                if( t instanceof IRRecursive )
                {
                    stack.push({ term: t.body, dbn: dbn + t.arity });
                    continue;
                }
                // no hoisted
            }
        }

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

        // console.log("replacing letted with value", prettyIRText( letted.value ) )
        for( const ref of sameLettedRefs )
        {
            _modifyChildFromTo(
                ref.parent,
                ref,
                new IRVar( getDebruijnInTerm( parentNodeDirectChild, ref ) )
            );
        }

        const delayed = parentNode instanceof IRDelayed;
        let finalMaxScope: IRFunc = parentNode as any;
        while(!( finalMaxScope instanceof IRFunc ))
        {
            finalMaxScope = (finalMaxScope as any).parent as any
        }
        // console.log("final max scope (delayed: " + delayed + ")" , prettyIRJsonStr( finalMaxScope ) )

    }
}


function remove<T>( array: T[], shouldRemove: (elem: T, i: number) => boolean ): void
{
    for( let i = 0; i < array.length; i++ )
    {
        if( shouldRemove( array[i], i ) )
        {
            array.splice( i, 1 );
        }
    }
}

function removeFirst<T>( array: T[], shouldRemove: (elem: T, i: number) => boolean ): void
{
    for( let i = 0; i < array.length; i++ )
    {
        if( shouldRemove( array[i], i ) )
        {
            array.splice( i, 1 );
            break;
        }
    }
}

function removeIdx( array: any[], idx: number ): void
{
    array.slice( idx, 1 );
}

function filterWithIndex<T>( array: T[], predicate: ( elem: T, i: number ) => boolean ): { elem: T, i: number }[]
{
    return array.map((elem, i) => ({ elem, i })).filter(({ elem, i }) => predicate( elem, i ));
}

function isChildOf( child: IRTerm | undefined, parent: IRTerm ): boolean
{
    do
    {
        if( !child ) return false;
        if( child === parent ) return true;
    } while( child = child?.parent );

    return false;
}

/**
 * 
 * @param letted 
 * @returns {IRFunc} the lowest `IRFunc` in the tree that defines all the variables needed for the 
 */
function findLettedMaxScope( letted: IRLetted ): IRFunc
{
    let minUnboundDbn = _getMinUnboundDbn( letted.value );
    if( minUnboundDbn === undefined )
    {
        let tmp: IRTerm = letted;
        let maxScope: IRFunc | undefined = undefined;
        while( tmp.parent )
        {
            tmp = tmp.parent
            if( tmp instanceof IRFunc ) maxScope = tmp;
        };
        if( !maxScope ) throw new Error(
            `could not find a max scope for letted value with hash ${irHashToHex(letted.hash)}`
        );
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