import { IRCase, IRConstr } from "../../IRNodes";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { mapArrayLike } from "../../IRNodes/utils/mapArrayLike";
import { IRTerm } from "../../IRTerm";
import { defineDepth, IRTermWithDepth } from "./depth";

export function _addDepths( _term: IRTerm, initialDepth = 0 ): void
{
    const stack: IRTermWithDepth[] = [defineDepth( _term, initialDepth )];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTermWithDepth;
        
        if( t instanceof IRApp )
        {
            stack.push(
                defineDepth( t.fn , t.depth + 1 ), 
                defineDepth( t.arg, t.depth + 1 )
            );
            continue;
        }

        if( t instanceof IRCase )
        {
            const nextDepth = t.depth + 1;
            stack.push(
                defineDepth( t.constrTerm, nextDepth ),
                ...mapArrayLike(
                    t.continuations,
                    ( continuation ) => defineDepth( continuation, nextDepth )
                )
            );
            continue;
        }

        if( t instanceof IRConstr )
        {
            stack.push(
                ...mapArrayLike(
                    t.fields,
                    ( field ) => defineDepth( field, t.depth + 1 )
                )
            );
            continue;
        }

        if( t instanceof IRDelayed )
        {
            stack.push( defineDepth( t.delayed, t.depth + 1 ) )
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push( defineDepth( t.forced, t.depth + 1 ) )
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push( defineDepth( t.body, t.depth + 1 ) )
            continue;
        }

        if( t instanceof IRRecursive )
        {
            stack.push( defineDepth( t.body, t.depth + 1 ) )
            continue;
        }
        
        if( t instanceof IRHoisted )
        {
            // 0 because hoisted are closed
            // for hoisted we keep track of the depth inside the term
            stack.push( defineDepth( t.hoisted, 0 ) );
            continue;
        }

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push( defineDepth( t.value, 0 ) );
            continue;
        }
    }
}
