import { IRConst } from "../..";
import { IRVar, IRError } from "../../IRNodes";
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
import { IRSelfCall } from "../../IRNodes/IRSelfCall";
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

        if(
            isInRecursiveTerm && (
                t instanceof IRHoisted
                || t instanceof IRLetted
            )
        ) {
            t.meta.forceHoist = true;
            // don't push anything to the stack
            // hoisted values are handled normally
            continue;
        }

        if( t instanceof IRApp )
        {
            stack.push(
                { term: t.fn, isInRecursiveTerm },
                { term: t.arg, isIRAppArg: true, isInRecursiveTerm },
            );
            continue;
        }
        if( t instanceof IRConstr )
        {
            stack.push(
                ...Array.from( t.fields )
                .map( f => ({
                    term: f,
                    isIRAppArg: true,
                    isInRecursiveTerm
                }))
            );
            continue;
        }
        if( t instanceof IRCase )
        {
            stack.push(
                {
                    term: t.constrTerm,
                    isIRAppArg: false,
                    isInRecursiveTerm
                },
                ...Array.from( t.continuations )
                .map( cont => ({
                    term: cont,
                    isIRAppArg: false,
                    isInRecursiveTerm
                }))
            );
            continue;
        }

        stack.push(
            ...(t.children?.().map( c => ({ term: c, isInRecursiveTerm })) ?? [])
        );
    }
}