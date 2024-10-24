import { IRApp } from "../../IRNodes/IRApp";
import { IRCase } from "../../IRNodes/IRCase";
import { IRConstr } from "../../IRNodes/IRConstr";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRNative } from "../../IRNodes/IRNative";
import { IRNativeTag } from "../../IRNodes/IRNative/IRNativeTag";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";

type StackElem = {
    term: IRTerm, 
    // dbn: number,
    isIRAppArg?: boolean, 
    isInRecursiveTerm: boolean 
};

export function markRecursiveHoistsAsForced( _term: IRTerm ): void
{
    const stack: StackElem[] = [{ term: _term, isInRecursiveTerm: false }];

    while( stack.length > 0 )
    {
        const { term: t, isInRecursiveTerm, isIRAppArg } = stack.pop() as StackElem;

        if( t instanceof IRApp )
        {
            // must push the arg first and then the fucntion
            // so that we can check if the function is the Z combinator before the arg is processed
            stack.push(
                { term: t.arg, isIRAppArg: true, isInRecursiveTerm },
                { term: t.fn, isInRecursiveTerm }
            );
            continue;
        }
        if( t instanceof IRConstr )
        {
            // must push the arg first and then the fucntion
            // so that we can check if the function is the Z combinator before the arg is processed
            stack.push(
                ...Array.from( t.fields )
                .map( (f, i) => ({
                    term: f,
                    isIRAppArg: i > 0,
                    isInRecursiveTerm
                }))
            );
            continue;
        }
        if( t instanceof IRCase )
        {
            // must push the arg first and then the fucntion
            // so that we can check if the function is the Z combinator before the arg is processed
            stack.push(
                {
                    term: t.constrTerm,
                    isIRAppArg: false,
                    isInRecursiveTerm
                },
                ...Array.from( t.continuations )
                .map( cont => ({
                    term: cont,
                    isIRAppArg: true,
                    isInRecursiveTerm
                }))
            );
            continue;
        }

        if(
            t instanceof IRNative &&
            t.tag === IRNativeTag.z_comb &&
            stack.length > 0 && (stack[ stack.length - 1 ].isIRAppArg === true)
        )
        {
            stack[ stack.length - 1 ].isInRecursiveTerm = true;
            continue;
        }

        if(
            t instanceof IRHoisted || 
            t instanceof IRLetted
        )
        {
            // if it is an hoisted/letted
            // DIRECTLY applied to something that makes it recursive
            if(
                isIRAppArg && 
                t.parent instanceof IRApp && 
                t.parent.fn instanceof IRNative &&
                t.parent.fn.tag === IRNativeTag.z_comb
            )
            {
                // then check the hoisted/letted value instead of marking as hoisted
                if( t instanceof IRLetted )
                {
                    stack.push({ term: t.value, isInRecursiveTerm });
                    continue;
                }
                else // if( t instanceof IRHoisted )
                {
                    stack.push({ term: t.hoisted, isInRecursiveTerm });
                    continue;
                }
                continue;
            }

            if( isInRecursiveTerm )
            {
                t.meta.forceHoist = true;
                // don't push anything to the stack
                // hoisted values are handled normally
                continue;
            }
            // otherwhise check in values too
            else if( t instanceof IRLetted )
            {
                stack.push({ term: t.value, isInRecursiveTerm });
                continue;
            }
            else if( t instanceof IRHoisted )
            {
                stack.push({ term: t.hoisted, isInRecursiveTerm });
                continue;
            }
        }

        if( t instanceof IRDelayed )
        {
            stack.push({ term: t.delayed, isInRecursiveTerm })
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push({ term: t.forced, isInRecursiveTerm });
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push({ term: t.body, isInRecursiveTerm });
            continue;
        }

        if( t instanceof IRRecursive )
        {
            stack.push({ term: t.body, isInRecursiveTerm: true });
            continue;
        }
    }
}