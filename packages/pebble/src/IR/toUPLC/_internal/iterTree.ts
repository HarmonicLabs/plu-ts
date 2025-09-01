import { IRApp } from "../../IRNodes/IRApp";
import { IRCase } from "../../IRNodes/IRCase";
import { IRConstr } from "../../IRNodes/IRConstr";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";

export function iterTree(
    _term: IRTerm,
    fn: ( elem: IRTerm, dbn: number ) => (boolean | undefined | void),
    // necessary for letted hash calculation (exclude hoisted)
    shouldSkipNode?: ( elem: IRTerm, dbn: number ) => boolean,
    shouldExit?: ( elem: IRTerm, dbn: number ) => boolean
): void
{
    const has_shouldSkipNode = typeof shouldSkipNode === "function";
    const has_shouldExit = typeof shouldExit === "function";
    const stack: { term: IRTerm, dbn: number, shouldPopIfParentIsModified?: boolean }[] = [{ term: _term, dbn: 0 }];

    while( stack.length > 0 )
    {
        const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if( has_shouldSkipNode && shouldSkipNode( t, dbn ) ) continue;

        const termParent = t.parent;
        const negDbn = t instanceof IRFunc || t instanceof IRRecursive ? t.arity : 0;

        const modifiedParent = fn( t, dbn ) === true;

        if( has_shouldExit && shouldExit( t, dbn ) ) return;

        if( modifiedParent && termParent !== undefined )
        {
            while( stack.length > 0 && stack[ stack.length - 1 ].shouldPopIfParentIsModified )
            {
                // there is an extra node 
                stack.pop();
            }
            // restart from the parent
            stack.push({ term: termParent, dbn: dbn - negDbn });
            continue;
        }
        
        if( t instanceof IRApp )
        {
            // sanifyTree as we go
            if( t.fn.parent !== t ) t.fn = t.fn.clone();
            if( t.arg.parent !== t ) t.arg = t.arg.clone();

            stack.push(
                { term: t.fn, dbn  },
                { term: t.arg, dbn, shouldPopIfParentIsModified: true }
            );
            continue;
        }

        if( t instanceof IRCase )
        {
            // sanifyTree as we go
            if( t.constrTerm.parent !== t ) t.constrTerm = t.constrTerm.clone();
            for( let i = 0; i < t.continuations.length; i++ )
            {
                if( t.continuations[ i ].parent !== t ) t.continuations[ i ] = t.continuations[ i ].clone();
            }

            stack.push(
                { term: t.constrTerm, dbn },
                ...Array.from( t.continuations ).map( cont => 
                    ({ term: cont, dbn, shouldPopIfParentIsModified: true })
                )
            );
            continue;
        }
        if( t instanceof IRConstr )
        {
            // sanifyTree as we go
            for( let i = 0; i < t.fields.length; i++ )
            {
                if( t.fields[ i ].parent !== t ) t.fields[ i ] = t.fields[ i ].clone();
            }
            stack.push(
                ...Array.from( t.fields ).map(( f, i ) => 
                    ({ term: f, dbn, shouldPopIfParentIsModified: i !== 0 })
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
