import { IRApp } from "../../../IRNodes/IRApp";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRLetted, LettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
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
        if( maxScope instanceof IRFunc )
        {
            minUnboundDbn -= maxScope.arity
        }

        while( minUnboundDbn >= 0 )
        {
            maxScope = maxScope?.parent;
            if( maxScope instanceof IRFunc )
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
 * @param term 
 * @returns {number | undefined} a `number` indicating the minimum debruijn `undefined` if the term is closed
 */
export function _getMinUnboundDbn( _term: IRTerm ): number | undefined
{
    let minDbn: number | undefined = undefined;
    const stack: { term: IRTerm, dbn: number }[] = [{ term: _term, dbn: 0 }]

    while( stack.length > 0 )
    {
        const { term, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if( term instanceof IRVar )
        {
            if( dbn <= term.dbn ) // some val outside
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
        
        // closed
        // if( term instanceof IRHoisted )

        // letted do count too
        if( term instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push({ term: term.value, dbn });
            continue;
        }
    }

    return minDbn;
}