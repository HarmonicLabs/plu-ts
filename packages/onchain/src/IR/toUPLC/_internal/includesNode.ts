import { IRCase } from "../../IRNodes/IRCase";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRTerm } from "../../IRTerm";
import { IRConstr } from "../../IRNodes/IRConstr";
import { IRRecursive } from "../../IRNodes/IRRecursive";

export function includesNode( parent: IRTerm, predicate: ( node: IRTerm ) => boolean ): boolean
{
    const stack: IRTerm[] = [parent];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( predicate( t ) ) return true;

        if( t instanceof IRLetted )
        {
            stack.push( t.value );
            continue;
        }

        if( t instanceof IRApp )
        {
            stack.push(
                t.fn,
                t.arg
            );
            continue;
        }

        if( t instanceof IRCase )
        {
            stack.push(
                t.constrTerm,
                ...t.continuations
            );
            continue;
        }

        if( t instanceof IRConstr )
        {
            stack.push(
                ...t.fields
            );
            continue;
        }

        if( t instanceof IRDelayed )
        {
            stack.push( t.delayed )
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push( t.forced );
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push( t.body );
            continue;
        }

        if( t instanceof IRRecursive )
        {
            stack.push( t.body );
            continue;
        }
        
        if( t instanceof IRHoisted )
        {
            stack.push( t.hoisted );
            continue;
        }
    }

    return false;
}