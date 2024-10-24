import { IRCase } from "../../IRNodes/IRCase";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRTerm } from "../../IRTerm";
import { mapArrayLike } from "../../IRNodes/utils/mapArrayLike";
import { IRConstr } from "../../IRNodes";
import { IRRecursive } from "../../IRNodes/IRRecursive";

type StackEntry = { term: IRTerm, dbn: number };

export function getDiffDbn( parentNode: IRTerm, childNode: IRTerm ): number | undefined
{
    const stack: StackEntry[] = [{ term: parentNode, dbn: 0 }];

    while( stack.length > 0 )
    {
        const { term: t, dbn } = stack.pop() as StackEntry;

        if( t === childNode ) return dbn;

        if( t instanceof IRLetted )
        {
            stack.push({ term: t.value, dbn });
            continue;
        }

        if( t instanceof IRApp )
        {
            stack.push(
                { term: t.fn, dbn },
                { term: t.arg, dbn }
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

        if( t instanceof IRRecursive )
        {
            stack.push({ term: t.body, dbn: dbn + t.arity });
            continue;
        }
        
        if( t instanceof IRHoisted )
        {
            stack.push({ term: t.hoisted, dbn });
            continue;
        }
    }

    return undefined;
}