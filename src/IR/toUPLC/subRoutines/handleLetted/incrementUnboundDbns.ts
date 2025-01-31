import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRCase } from "../../../IRNodes/IRCase";
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRConstr } from "../../../IRNodes/IRConstr";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";

/**
 *  add 1 to every var's DeBruijn that accesses stuff outside the parent node
 *  not including the `parentNode` node
 *  since the new function introdcued substituting the letted term
 *  is added inside the `parentNode` node
**/
export function incrementUnboundDbns(
    theTerm: IRTerm, 
    shouldNotModifyLetted: (letted: IRLetted, dbn: number ) => boolean
): void
{
    const stack: { term: IRTerm, dbn: number }[] = [{ term: theTerm, dbn: 0 }];
    while( stack.length > 0 )
    {
        const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if(
            (
                t instanceof IRVar ||
                t instanceof IRSelfCall
            ) &&
            t.dbn >= dbn
        )
        {
            // there's a new variable in scope
            t.dbn++;
            continue;
        }
        if( t instanceof IRLetted )
        {
            if( shouldNotModifyLetted( t, dbn ) )
            {
                // don't modify letted to be hoisted
                continue;
            }
            else // other letted to be handled in one of the next cycles
            {
                // `IRLambdas` DeBruijn are tracking the level of instantiation
                // we add a new variable so the dbn of instantiation increments
                t.dbn += 1;
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
        // skip hoisted since closed
    }
}