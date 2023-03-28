import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, jsonLettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepth } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAll } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { groupByScope } from "./groupByScope";
import { IRCompilationError } from "../../../../../errors/PlutsIRError/IRCompilationError";
import { prettyIRJsonStr, prettyIRText, showIR } from "../../../utils/showIR";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";

export function handleLetted( term: IRTerm ): void
{
    const allLetteds = getLettedTerms( term );

    console.log( allLetteds.map( jsonLettedSetEntry ) );

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
        const n = lettedSet.length;
        let a = 0;
        let b = 0;
        const toLet: IRLetted[] = new Array( n );
        const toInline: IRLetted[] = new Array( n );

        // filter out terms with single reference
        for( let i = 0; i < n; i++ )
        {
            const thisLettedEntry = lettedSet[i];
            if(
                // inline
                // - terms used once (with single reference)
                // - letted varibles (also used multiple times)
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

        console.log( lettedSet.map( jsonLettedSetEntry ) );

        const toInlineHashes = toInline.map( termToInline => termToInline.hash );

        // increase the debruijn index to account for newly introduced (and applied) `IRFunc`
        // needs to be from last to first so that hashes will not change
        // (aka. we replace dependents before dependecies)
        for( let i = lettedSet.length - 1; i >= 0; i-- )
        {
            // one of the many to be letted
            letted = lettedSet[i].letted;
            const slicedLettedSetHashes = 
                lettedSet.slice( 0, i + 1 )
                .map( setEntry => setEntry.letted.hash );

            const replacedLettedSetEntry = new Array( i + 1 ).fill( false );

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
                    const lettedSetIdx = slicedLettedSetHashes.findIndex( h => uint8ArrayEq( elHash, h ) );
                    if( lettedSetIdx >= 0 )
                    {
                        if( replacedLettedSetEntry[ lettedSetIdx ] )
                        {
                            if( elem.dbn < lettedSet[ lettedSetIdx ].letted.dbn )
                            lettedSet[ lettedSetIdx ].letted = elem; 
                        }
                        else
                        {
                            lettedSet[ lettedSetIdx ].letted = elem;
                            replacedLettedSetEntry[ lettedSetIdx ] = true;
                        }
                    }

                    // return true if `elem` is the `letted` being handled in this turn 
                    return uint8ArrayEq( elHash, letted.hash );
                }
            ) as any;

            if(
                // the letted hash is one of the ones to be inlined
                toInlineHashes.some( h => uint8ArrayEq( h, letted.hash ) )
            )
            {
                console.log( "inlining", toHex( letted.hash ) );
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

            console.log(
                "handling", toHex( letted.hash ), prettyIRText( letted.value ),
                "\nin", prettyIRJsonStr( maxScope )
            );
            lettedSet[i].letted = letted = refs[0];
            toHex( letted.hash );

            // add 1 to every var's DeBruijn that accesses stuff outside the max scope
            // maxScope node is non inclusive since the new function is added inside the node 
            const stack: { term: IRTerm, dbn: number }[] = [{ term: maxScope.body, dbn: 0 }];
            while( stack.length > 0 )
            {
                const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

                console.log( prettyIRText( t ) );

                if( t instanceof IRVar )
                {
                    console.log(
                        "var's dbn:", t.dbn, 
                        "dbn in term:", dbn, 
                        "becomes:", t.dbn >= dbn ? t.dbn + 1 : t.dbn
                    );
                }

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
                    if( // the letted hash is one of the ones to be inlined
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
                    else if( uint8ArrayEq( t.hash, letted.hash ) )
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

            // now we replace
            const clonedLettedVal = letted.value.clone();
            
            console.log("------------------------------- replacing letted term -------------------------------");
            console.log("------------------------------- replacing letted term -------------------------------");
            console.log("------------------------------- replacing letted term -------------------------------");

            console.log( prettyIRText( maxScope ) );

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

                    if( t instanceof IRVar )
                    {
                        console.log(
                            "var's dbn:", t.dbn, 
                            "dbn in term: ", dbn, 
                            "becomes:", t.dbn > dbn ? t.dbn - diffDbn : t.dbn
                        );
                    }

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
                    // no hoisted
                }
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