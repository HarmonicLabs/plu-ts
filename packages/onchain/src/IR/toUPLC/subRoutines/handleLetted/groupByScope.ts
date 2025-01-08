import { IRApp } from "../../../IRNodes/IRApp";
import { IRCase } from "../../../IRNodes/IRCase";
import { IRConstr } from "../../../IRNodes/IRConstr";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRLetted, LettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRTerm } from "../../../IRTerm";

type ScopedLettedTerms = {
    maxScope: IRFunc | undefined, // udefined is any scope (root)
    group: LettedSetEntry[]
}

export function groupByScope( letteds: LettedSetEntry[] ): ScopedLettedTerms[]
{
    const scopes: ScopedLettedTerms[] = [];

    function pushScope( scope: IRFunc | undefined, letted: LettedSetEntry )
    {
        const scopeEntry = scopes.find( entry => entry.maxScope === scope );
        if( scopeEntry === undefined )
        {
            scopes.push({
                maxScope: scope,
                group: [letted]
            });
            return;
        }
        scopeEntry.group.push( letted );
    }

    for( const { letted, nReferences } of letteds )
    {
        let minUnboundDbn = _getMinUnboundDbn( letted.value );
        if( minUnboundDbn === undefined )
        {
            pushScope( undefined, { letted, nReferences } );
            continue;
        }

        let maxScope: IRTerm | undefined = letted.parent;
        if(
            maxScope instanceof IRFunc || 
            maxScope instanceof IRRecursive
        )
        {
            minUnboundDbn -= maxScope.arity;
        }

        while( minUnboundDbn >= 0 )
        {
            maxScope = maxScope?.parent;
            if(
                maxScope instanceof IRFunc || 
                maxScope instanceof IRRecursive
            )
            {
                minUnboundDbn -= maxScope.arity
            }
        }

        pushScope( maxScope as IRFunc, { letted, nReferences } )
    }

    return scopes;
}

/**
 * 
 * @param _term 
 * @returns {number | undefined}
 *  a `number` if the `_term` param is open; 
 *  represents the debuijn index an `IRVar` would have 
 *  in order to point to the smallest scope that fulfills the term;
 * 
 *  `undefined` if the term is closed
 */
export function _getMinUnboundDbn( _term: IRTerm ): number | undefined
{
    let minDbn: number | undefined = undefined;
    const stack: { term: IRTerm, dbn: number }[] = [{ term: _term, dbn: 0 }]

    while( stack.length > 0 )
    {
        const { term, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if(
            term instanceof IRVar ||
            term instanceof IRSelfCall
        )
        {
            if( term.dbn >= dbn ) // some val outside
            {
                const outsideDbn = term.dbn - dbn;
                minDbn = minDbn === undefined ? outsideDbn : Math.min( outsideDbn, minDbn );
            }
        }

        if( term instanceof IRApp )
        {
            stack.push(
                { term: term.fn, dbn  },
                { term: term.arg, dbn }
            );
            continue;
        }

        if( term instanceof IRCase )
        {
            stack.push(
                { term: term.constrTerm, dbn },
                ...mapArrayLike(
                    term.continuations,
                    continuation => ({ term: continuation, dbn })
                )
            );
            continue;
        }

        if( term instanceof IRConstr )
        {
            stack.push(
                ...mapArrayLike(
                    term.fields,
                    field => ({ term: field, dbn })
                )
            );
            continue
        }

        if( term instanceof IRDelayed )
        {
            stack.push({ term: term.delayed, dbn })
            continue;
        }
        if( term instanceof IRForced )
        {
            stack.push({ term: term.forced, dbn });
            continue;
        }
        if( term instanceof IRFunc )
        {
            stack.push({ term: term.body, dbn: dbn + term.arity });
            continue;
        }
        if( term instanceof IRRecursive )
        {
            stack.push({ term: term.body, dbn: dbn + term.arity });
            continue;
        }
        // letted terms do count too
        if( term instanceof IRLetted )
        {
            stack.push({ term: term.value, dbn });
            continue;
        }
        // closed
        // if( term instanceof IRHoisted )
    }

    return minDbn;
}