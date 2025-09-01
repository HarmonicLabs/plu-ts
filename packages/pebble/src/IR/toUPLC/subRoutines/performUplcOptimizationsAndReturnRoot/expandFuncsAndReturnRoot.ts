import { IRConstr } from "../../../IRNodes";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRCase } from "../../../IRNodes/IRCase";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";

export function getExpandedIRFunc( body: IRTerm, arity: number ): IRFunc
{
    body = new IRFunc( 1, body );
    while( --arity > 0 )
    {
        body = new IRFunc( 1, body );
    }
    return body as IRFunc;
    // if( arity === 1 ) return new IRFunc( 1, body );
    // return new IRFunc( 1, getExpandedIRFunc( body, arity - 1 ) );
}

export function expandFuncsAndReturnRoot( root: IRTerm ): IRTerm
{
    const stack: IRTerm[] = [ root ];

    while( stack.length > 0 )
    {
        const t = stack.pop()!;

        if( t instanceof IRFunc )
        {
            // whatever happens we continue from the body
            stack.push( t.body );

            // all good
            if( t.arity <= 1 ) continue;

            const expanded = getExpandedIRFunc( t.body, t.arity );

            if( t.parent )
            {
                _modifyChildFromTo( t.parent, t, expanded );
            }
            else
            {
                root = expanded;
            }

            continue;
        }

        if( t instanceof IRApp )
        {
            stack.push( t.fn, t.arg );
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
            stack.push( ...t.fields );
            continue;
        }

        if( t instanceof IRDelayed )
        {
            stack.push( t.delayed );
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push( t.forced );
            continue;
        }

        if(
            t instanceof IRRecursive ||
            t instanceof IRHoisted ||
            t instanceof IRLetted ||
            t instanceof IRSelfCall
        )
        {
            throw new Error("Unexpected term while performing uplc optimizations");
        }
    }

    return root;
}