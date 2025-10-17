import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRTerm } from "../../IRTerm";

export function findAll( term: IRTerm, predicate: ( elem: IRTerm ) => boolean ): IRTerm[]
{
    const stack: IRTerm[] = [ term ];
    const result: IRTerm[] = [];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( predicate( t ) ) result.push( t );
        
        stack.push( ...t.children() );
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

        if( t instanceof IRHoisted )
        {
            // this is `findAllNoHoisted` remember?
            // stack.push( t.hoisted );
            continue;
        }
        
        stack.push( ...t.children() );
    }

    return result;
}
