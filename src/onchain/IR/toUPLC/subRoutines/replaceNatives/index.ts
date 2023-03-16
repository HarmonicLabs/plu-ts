import { IRApp } from "../../../IRNodes/IRApp";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRNative } from "../../../IRNodes/IRNative";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { iterTree } from "../../_internal/iterTree";
import { nativeToIR } from "./nativeToIR";

export function replaceNativesAndReturnRoot( tree: IRTerm ): IRTerm
{
    if( tree instanceof IRNative )
    {
        return nativeToIR( tree );
    }

    iterTree( tree, elem => {
        if( elem instanceof IRNative )
        {
            _modifyChildFromTo(
                elem.parent,
                elem,
                nativeToIR( elem )
            );
            return elem.tag < 0;
        }
    });
    return tree;
}

export function includesNegativeNatives( _term: IRTerm ): boolean
{
    const stack: IRTerm[] = [_term];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( t instanceof IRNative )
        {
            if( t.tag < 0 ) return true;
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

        if( t instanceof IRDelayed )
        {
            stack.push(t.delayed)
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push(t.forced);
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push(t.body);
            continue;
        }
        
        if( t instanceof IRHoisted )
        {
            // 0 because hoisted are closed
            // for hoisted we keep track of the depth inside the term
            stack.push(t.hoisted);
            continue;
        }

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push(t.value);
            continue;
        }
    }
    return false;
}

export function replaceNestedNativesAndReturnRoot( tree: IRTerm ): IRTerm
{
    if( tree instanceof IRNative )
    {
        let replacement = nativeToIR( tree );
        let prev = replacement;
        while( includesNegativeNatives( replacement ) )
        {
            prev = re
        };

        return prev
    }

    const stack: IRTerm[] = [tree];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( t instanceof IRNative )
        {
            if( t.tag < 0 ) return true;
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

        if( t instanceof IRDelayed )
        {
            stack.push(t.delayed)
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push(t.forced);
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push(t.body);
            continue;
        }
        
        if( t instanceof IRHoisted )
        {
            // 0 because hoisted are closed
            // for hoisted we keep track of the depth inside the term
            stack.push(t.hoisted);
            continue;
        }

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push(t.value);
            continue;
        }
    }
    return tree;
}