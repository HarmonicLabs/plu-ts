import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRTerm } from "../../IRTerm";

export function iterTree(
    _term: IRTerm,
    fn: ( elem: IRTerm, dbn: number ) => (boolean | undefined | void),
    // necessary for letted hash calculation (exclude hoisted)
    shouldSkipNode?: ( elem: IRTerm, dbn: number ) => boolean
): void
{
    const has_shouldSkipNode = typeof shouldSkipNode === "function";
    const stack: { term: IRTerm, dbn: number, isIRAppArg?: boolean }[] = [{ term: _term, dbn: 0 }];

    while( stack.length > 0 )
    {
        const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if( has_shouldSkipNode && shouldSkipNode( t, dbn ) )  continue;

        const termParent = t.parent;
        const negDbn = t instanceof IRFunc ? t.arity : 0;

        const modifiedParent = Boolean( fn( t, dbn ) );

        if( modifiedParent && termParent !== undefined )
        {
            if( stack.length > 0 && stack[ stack.length - 1 ].isIRAppArg )
            {
                // there is an extra node 
                stack.pop();
            }
            stack.push({ term: termParent, dbn: dbn - negDbn });
            continue;
        }
        
        if( t instanceof IRApp )
        {
            stack.push(
                { term: t.fn, dbn  },
                { term: t.arg, dbn, isIRAppArg: true }
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
        
        if( t instanceof IRHoisted )
        {
            // 0 because hoisted are closed
            // for hoisted we keep track of the depth inside the term
            stack.push({ term: t.hoisted, dbn: 0 });
            continue;
        }

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push({ term: t.value, dbn });
            continue;
        }
    }
}
