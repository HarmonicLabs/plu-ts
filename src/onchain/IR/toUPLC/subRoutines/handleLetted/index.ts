import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRLettedMissingLCA } from "../../../../../errors/PlutsIRError/IRCompilationError/IRLettedMissingLCA";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, jsonLettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepth } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAll } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { iterTree } from "../../_internal/iterTree";
import { groupByScope } from "./groupByScope";
import { IRCompilationError } from "../../../../../errors/PlutsIRError/IRCompilationError";
import { showIR } from "../../../utils/showIR";
import { fn } from "../../../../pluts";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";

export function handleLetted( term: IRTerm ): void
{
    const allLetteds = getLettedTerms( term );

    const groupedLetteds = groupByScope( allLetteds );

    for( const { maxScope, group } of groupedLetteds )
    {
        if( maxScope === undefined )
        {
            throw new IRCompilationError(
                "found 'IRLetted' with closed value not replaced by an 'IRHoisted'\n\nclosed letted terms: " +
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
        let n = lettedSet.length;
        let a = 0;
        let b = 0;
        const toLet: IRLetted[] = new Array( n );
        const toInline: IRLetted[] = new Array( n );

        // console.log( lettedSet.map( jsonLettedSetEntry ) );
        // console.log( lettedSet.map( letted => letted.letted.dependencies ) );
        
        // filter out terms with single reference
        for( let i = 0; i < n; i++ )
        {
            const thisLettedEntry = lettedSet[i];
            // console.log( thisHoistedEntry.nReferences, thisHoistedEntry.letted.parent )
            if(
                thisLettedEntry.nReferences === 1 &&
                thisLettedEntry.letted.parent
            )
            {
                // inline with single reference
                toInline[ b++ ] = thisLettedEntry.letted
            }
            else toLet[ a++ ] = thisLettedEntry.letted;
        }

        // drop unused space
        toLet.length = a;
        toInline.length = b;

        const toInlineHashes = toInline.map( termToInline => termToInline.hash );

        let letted: IRLetted;
        // inline single references from last to first
        // needs to be from last to first so that hashes will not change
        for( let i = toInline.length - 1; i >= 0 ; i-- )
        {
            letted = toInline[i] as IRLetted;
            _modifyChildFromTo(
                letted.parent,
                letted,
                letted.value
            );
        }

        for( let i = toLet.length - 1; i >= 0; i-- )
        {
            // one of the many to be letted
            letted = toLet[i];

            /**
             * all the letted corresponding to this value
             * 
             * @type {IRLetted[]}
             * we know is an `IRLetted` array
             * an not a generic `IRTerm` array
             * because that's what the 
             * filter funciton checks for
             */
            const refs: IRLetted[] = findAll(
                maxScope,
                elem => 
                    elem instanceof IRLetted &&
                    uint8ArrayEq( elem.hash, letted.hash )
            ) as any;

            // if letting a plain varible
            // just inline the variable as it is more efficient
            // and then continue with next group
            if( letted.value instanceof IRVar )
            {
                // inline directly the refereces
                for( const ref of refs )
                {
                    _modifyChildFromTo(
                        ref?.parent,
                        ref as any,
                        ref.value
                    )
                }
                continue;
            }

            // add 1 to every var's DeBruijn that accesses stuff outside the max scope
            // maxScope node is non inclusive since the new function is added insite the node 
            const stack: { term: IRTerm, dbn: number }[] = [{ term: maxScope.body, dbn: 0 }];

            while( stack.length > 0 )
            {
                const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

                if( t instanceof IRVar )
                {
                    console.log(
                        "----------------------------------------------------------------------------\n",
                        "adding letted: " + toHex( letted.hash ) + "\n",
                        "with value: " + JSON.stringify( showIR( letted.value ), undefined, 2 ) + "\n\n",
                        showIR( t.parent as any ), 
                        "\n\nnode.dbn", t.dbn, "\ndbn", dbn,
                        "\n----------------------------------------------------------------------------",
                    )
                }

                if(
                    t instanceof IRVar &&
                    t.dbn >= dbn
                )
                {
                    // there's a new variable in scope
                    t.dbn++;
                    console.log(
                        showIR( maxScope )
                    )
                }
                if( t instanceof IRLetted )
                {
                    if( // the letted has is one of the ones to be inlined
                        toInlineHashes.some( h => uint8ArrayEq( h, t.hash ) )
                    )
                    {
                        // inline
                        _modifyChildFromTo(
                            t.parent,
                            t,
                            t.value
                        );
                    }
                    else
                    {
                        // `IRLambdas` DeBruijn are tracking the level of instantiation
                        // since a new var has been introduced above
                        // we must increment regardless
                        t.dbn++
                    }
                }

                
                if( t instanceof IRApp )
                {
                    stack.push(
                        { term: t.fn, dbn  },
                        { term: t.arg, dbn }
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
                
                // skip hoisted and letted
                // we only want to modify the current body

                // if( t instanceof IRHoisted )
                // {
                //     // 0 because hoisted are closed
                //     // for hoisted we keep track of the depth inside the term
                //     stack.push({ term: t.hoisted, dbn });
                //     continue;
                // }

                // if( t instanceof IRLetted )
                // {
                //     // same stuff as the hoisted terms
                //     // the only difference is that depth is then incremented
                //     // once the letted term reaches its final position
                //     stack.push({ term: t.value, dbn });
                //     continue;
                // }
            }

            // get the difference in DeBruijn
            // between the maxScope and the letted term
            let tmpNode: IRTerm = letted;
            let diffDbn = 0;
            while( tmpNode !== maxScope )
            {
                tmpNode = tmpNode.parent as any;
                if( // is an intermediate `IRFunc`
                    tmpNode instanceof IRFunc && 
                    tmpNode !== maxScope 
                )
                {
                    // increment differential in DeBruijn by n vars indroduced here
                    diffDbn += tmpNode.arity;
                }
            }

            // now we inline
            const clonedLettedVal = letted.value.clone();

            // if there is any actual difference between the letted term
            // and the position where it will be finally placed
            // the value needs to be modified accoridingly
            if( diffDbn > 0 )
            {
                // adapt the variables in the term to be instantiated
                iterTree( clonedLettedVal, (elem) => {
                    if( elem instanceof IRVar || elem instanceof IRLetted )
                    {
                        elem.dbn -= diffDbn
                    }
                });
            }

            // save parent so when replacing we don't create a circular refs
            const parent = maxScope;
            // keep pointer to the old body
            // so we don't have to count the newly introduced `IRFunc` in `newNode`
            // while calling `getDeBruijnInTerm`
            // (subtracting 1 works too but this is an operation less)
            const oldBody = maxScope.body

            const newNode = new IRApp(
                new IRFunc(
                    1,
                    maxScope.body
                ),
                clonedLettedVal
            );

            _modifyChildFromTo(
                parent,
                maxScope.body,
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