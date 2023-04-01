import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRNative } from "../../IRNodes/IRNative";
import { IRNativeTag } from "../../IRNodes/IRNative/IRNativeTag";
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
        const { term: t, isInRecursiveTerm } = stack.pop() as StackElem;

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
            else // if( t instanceof IRHoisted )
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
    }
}