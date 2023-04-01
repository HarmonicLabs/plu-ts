import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, jsonLettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepths } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAll } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { groupByScope } from "./groupByScope";
import { IRCompilationError } from "../../../../../errors/PlutsIRError/IRCompilationError";
import { prettyIR, prettyIRJsonStr, prettyIRText, showIR } from "../../../utils/showIR";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { lowestCommonAncestor } from "../../_internal/lowestCommonAncestor";
import { PlutsIRError } from "../../../../../errors/PlutsIRError";
import { isIRTerm } from "../../../utils/isIRTerm";
import { markRecursiveHoistsAsForced } from "../markRecursiveHoistsAsForced";

export function handleLetted( term: IRTerm ): void
{
    // TODO: should probably merge `markRecursiveHoistsAsForced` inside `getLettedTerms` to iter once
    markRecursiveHoistsAsForced( term );
    const allLetteds = getLettedTerms( term );

    // console.log("direct letted", allLetteds.map( jsonLettedSetEntry ) );

    const groupedLetteds = groupByScope( allLetteds );

    for( const { maxScope, group } of groupedLetteds )
    {
        if( maxScope === undefined )
        {
            throw new IRCompilationError(
                "found 'IRLetted' with closed value not replaced by an 'IRHoisted'\n\nclosed letted terms:\n\n" +
                JSON.stringify(
                    group.map(
                        entry => showIR(entry.letted.value)
                    ),
                    undefined,
                    2
                )
            );
        }

        const lettedSet = getSortedLettedSet( group );

        // console.log( "all group letted", lettedSet.map( jsonLettedSetEntry ) );

        const n = lettedSet.length;
        let a = 0;
        let b = 0;
        const toLet: IRLetted[] = new Array( n );
        const toInline: IRLetted[] = new Array( n );

        // filter out terms with single reference
        for( let i = 0; i < n; i++ )
        {
            const thisLettedEntry = lettedSet[i];

            if( thisLettedEntry.letted.meta.forceHoist === true )
            {
                toLet[ a++ ] = thisLettedEntry.letted;
                continue;
            }


            if(
                // inline
                // - terms used once (with single reference)
                // - letted varibles (even if used multiple times)
                (
                    thisLettedEntry.nReferences === 1 &&
                    thisLettedEntry.letted.parent
                ) ||
                thisLettedEntry.letted.value instanceof IRVar
            )
            {
                toInline[ b++ ] = thisLettedEntry.letted
            }
            else toLet[ a++ ] = thisLettedEntry.letted;
        }

        // drop unused space
        toLet.length = a;
        toInline.length = b;

        /**
         * temp varible to hold reference to the letted term we are operating with
         */
        let letted: IRLetted;

        const toInlineHashes = toInline.map( termToInline => termToInline.hash );

        // increase the debruijn index to account for newly introduced (and applied) `IRFunc`
        // needs to be from last to first so that hashes will not change
        // (aka. we replace dependents before dependecies)
        for( let i = lettedSet.length - 1; i >= 0; i-- )
        {
            // needs to be at the start of the loop because it could be undefined at first
            // but needs also to be below in order to make sure that the reference we have
            // is from the tree itself (which has been possibly modified)
            letted = lettedSet[i].letted;

            // one of the many to be letted
            const lettedSetHashes = lettedSet.map( setEntry => setEntry.letted.hash );

            const replacedLettedSetEntry = new Array( lettedSet.length ).fill( false );

            /**
             * all the letted corresponding to this value
             * 
             * !!! IMPORTANT !!!
             * the `toInline` and `toLet` arrays might include cloned instances
             * that are not part of the tree
             * we must collect the instances directly from the tree
             * 
             * @type {IRLetted[]}
             * we know is an `IRLetted` array an not a generic `IRTerm` array
             * because that's what the filter funciton checks for
             */
            const refs: IRLetted[] = findAll(
                maxScope,
                elem => {
                    if(!(elem instanceof IRLetted)) return false;

                    const elHash = elem.hash;

                    /*
                        little side-effect here

                        we update the references in the `lettedSet`
                        with nodes actually present in the tree

                        so that if (when) the letted node is updated
                        the update is reflected in the lettedSet automaitcally
                    */
                    const lettedSetIdx = lettedSetHashes.findIndex( h => uint8ArrayEq( elHash, h ) );
                    const toLetIdx = toLet.findIndex( _toLet => uint8ArrayEq( _toLet.hash, elHash ) ) 

                    if( lettedSetIdx >= 0 )
                    {
                        if( replacedLettedSetEntry[ lettedSetIdx ] )
                        {
                            if( elem.dbn < lettedSet[ lettedSetIdx ].letted.dbn )
                            {
                                lettedSet[ lettedSetIdx ].letted = elem;

                                if( toLetIdx >= 0 )
                                {
                                    toLet[ toLetIdx ] = elem;
                                }
                                else
                                {
                                    const toInlIdx = toInline.findIndex( toInl => uint8ArrayEq( toInl.hash, elHash ) ) 
                                    toInline[ toInlIdx ] = elem
                                }
                            }
                        }
                        else
                        {
                            lettedSet[ lettedSetIdx ].letted = elem;
                            replacedLettedSetEntry[ lettedSetIdx ] = true;
                            if( toLetIdx >= 0 )
                            {
                                toLet[ toLetIdx ] = elem;
                            }
                            else
                            {
                                const toInlIdx = toInline.findIndex( toInl => uint8ArrayEq( toInl.hash, elHash ) ) 
                                toInline[ toInlIdx ] = elem
                            }
                        }
                    }

                    // return true if `elem` is the `letted` being handled in this turn 
                    return uint8ArrayEq( elHash, letted.hash );
                }
            ) as any;

            if( refs.length === 0 ) continue;

            // !!! IMPORTANT !!!
            // !!! DO NOT REMOVE !!!
            // makes sure the reference comes form the tree (possibly modified)
            letted = lettedSet[i].letted;

            if(
                refs.length === 1 || // inline single refs always
                // the letted hash is one of the ones to be inlined
                toInlineHashes.some( h => uint8ArrayEq( h, letted.hash ) )
            )
            {
                // console.log( "inlining", toHex( letted.hash ) );
                // console.log( prettyIRJsonStr( term ) );

                // inline single references from last to first
                // needs to be from last to first so that hashes will not change
                for( let i = refs.length - 1; i >= 0 ; i-- )
                {
                    letted = refs[i] as IRLetted;
                    _modifyChildFromTo(
                        letted.parent,
                        letted,
                        letted.value
                    );
                }
                continue; // go to next letted
            }

            // subtree migh change so depth will change
            // needs to be updated every loop
            _addDepths( maxScope );

            let lca: IRTerm | string = refs[0];
            for( let i = 1; i < refs.length; i++ )
            {
                lca = lowestCommonAncestor( lca as any, refs[i] as any );
            }

            if( !isIRTerm( lca ) )
            {
                throw new PlutsIRError(
                    refs.length + " letting nodes with hash " + toHex( letted.hash ) + " from different trees; error:" + lca
                );
            }

            while(!(
                lca instanceof IRFunc ||
                lca instanceof IRDelayed
            ))
            {
                lca = lca?.parent ?? "";
                if( !isIRTerm( lca ) )
                {
                    throw new PlutsIRError(
                        "lowest common ancestor outside the max scope"
                    );
                }
            }

            const parentNode: IRFunc | IRDelayed = lca;
            const parentNodeDirectChild = parentNode instanceof IRFunc ? parentNode.body : parentNode.delayed;

            // add 1 to every var's DeBruijn that accesses stuff outside the parent node
            // maxScope node is non inclusive since the new function is added inside the node 
            const stack: { term: IRTerm, dbn: number }[] = [{ term: parentNodeDirectChild, dbn: 0 }];
            while( stack.length > 0 )
            {
                const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

                // console.log( prettyIRText( t ), "stack length:", stack.length );

                if(
                    t instanceof IRVar &&
                    t.dbn >= dbn
                )
                {
                    // there's a new variable in scope
                    t.dbn++;
                    continue;
                }
                if( t instanceof IRLetted )
                {
                    if( uint8ArrayEq( t.hash, letted.hash ) )
                    {
                        // don't modify letted to be hoisted
                        continue;
                    }
                    else // other letted to be handled in one of the next cycles
                    {
                        // `IRLambdas` DeBruijn are tracking the level of instantiation
                        // we add a new variable so the dbn of instantiation increments
                        t.dbn += 1;
                        // DO NOT increment also dbns of the letted value
                        // that would change nothing since letted terms are normalized
                        // relative to the letted dbn
                        stack.push({ term: t.value, dbn });
                    }
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
                // skip hoisted since closed
            }

            // get the difference in DeBruijn
            // between the maxScope and the letted term
            let tmpNode: IRTerm = letted;
            let diffDbn = 0;
            while( tmpNode !== parentNode )
            {
                tmpNode = tmpNode.parent as any;
                if( // is an intermediate `IRFunc`
                    tmpNode instanceof IRFunc && 
                    tmpNode !== parentNode // avoid counting parent node arity if IRFunc 
                )
                {
                    // increment differential in DeBruijn by n vars indroduced here
                    diffDbn += tmpNode.arity;
                }
            }

            // console.log( "-------------------- adding letted value --------------------\n".repeat(3) );

            // now we replace
            const clonedLettedVal = letted.value.clone();
            
            // if there is any actual difference between the letted term
            // and the position where it will be finally placed
            // the value needs to be modified accoridingly
            if( diffDbn > 0 )
            {
                const stack: { term: IRTerm, dbn: number }[] = [{ term: clonedLettedVal, dbn: 0 }];

                while( stack.length > 0 )
                {
                    const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

                    // console.log( prettyIRText( t ) );

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
                    // no hoisted
                }
            }

            // save parent so when replacing we don't create a circular refs
            const parent = parentNode;
            // keep pointer to the old body
            // so we don't have to count the newly introduced `IRFunc` in `newNode`
            // while calling `getDeBruijnInTerm`
            // (subtracting 1 works too but this is an operation less)
            const oldBody = parentNodeDirectChild

            const newNode = new IRApp(
                new IRFunc(
                    1,
                    parentNodeDirectChild
                ),
                clonedLettedVal
            );

            _modifyChildFromTo(
                parent,
                parentNodeDirectChild, // not really used since we know parent is not `IRApp`
                newNode
            );

            for( const ref of refs )
            {
                _modifyChildFromTo(
                    ref?.parent,
                    ref as any,
                    // "- 1" is couting the `IRFunc` introduced with `newNode`
                    new IRVar( getDebruijnInTerm( oldBody, ref ) )
                )
            }
            
        }
        
    }
}