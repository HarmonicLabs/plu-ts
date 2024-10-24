import { IRCase, IRConstr } from "../../IRNodes";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";

export function findAll( term: IRTerm, predicate: ( elem: IRTerm ) => boolean ): IRTerm[]
{
    const stack: IRTerm[] = [term];
    const result: IRTerm[] = [];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( predicate( t ) ) result.push( t );
        
        if( t instanceof IRApp )
        {
            stack.push(
                t.fn,
                t.arg
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

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push( t.value );
            continue;
        }
    }

    return result;
}


export function findAllNoHoisted( term: IRTerm, predicate: ( elem: IRTerm ) => boolean ): IRTerm[]
{
    const stack: IRTerm[] = [term];
    const result: IRTerm[] = [];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( predicate( t ) ) result.push( t );
        
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
            // this is `findAllNoHoisted` remember?
            // stack.push( t.hoisted );
            continue;
        }

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push( t.value );
            continue;
        }
    }

    return result;
}
