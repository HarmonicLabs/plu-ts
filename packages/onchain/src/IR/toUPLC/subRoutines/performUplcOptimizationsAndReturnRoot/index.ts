import { IRConstr, IRNative } from "../../../IRNodes";
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
import { iterTree } from "../../_internal/iterTree";
import { CompilerOptions, CompilerUplcOptimizations, isDebugUplcOptimizations } from "../../CompilerOptions";
import { expandFuncsAndReturnRoot, getExpandedIRFunc } from "./expandFuncsAndReturnRoot";

export function performUplcOptimizationsAndReturnRoot(
    root: IRTerm,
    options: CompilerOptions
): IRTerm
{
    const opts = options.uplcOptimizations;
    if( isDebugUplcOptimizations( opts ) ) return root;

    const {
        groupApplications,
        inlineSingleUse,
        simplifyWrappedPartialFuncApps,
        removeForceDelay
    } = opts;

    root = expandFuncsAndReturnRoot( root );

    const stack: IRTerm[] = [ root ];

    while( stack.length > 0 )
    {
        const t = stack.pop()!;

        if( t instanceof IRApp )
        {
            if( isIdLike( t.fn ) )
            {
                if( t.parent ) _modifyChildFromTo( t.parent, t, t.arg );
                else root = t.arg;
                stack.push( t.arg );
                continue;
            }

            if( !groupApplications )
            {
                stack.push( t.fn, t.arg )
                continue;
            }

            const [ args, body, arity ] = getMultiAppArgsAndBody( t );

            if(
                arity <= 2 || 
                args.length <= 2
            )
            {
                stack.push( t.fn, t.arg );
                continue;
            }

            const newNode = new IRCase(
                new IRConstr( 0, args ),
                [
                    body
                ]
            );
            stack.push( body );

            if( t.parent )
            {
                _modifyChildFromTo( t.parent, t, newNode );
            }
            else
            {
                root = newNode;
            }
            continue;
        }

        if( t instanceof IRCase )
        {
            stack.push( t.constrTerm, ...t.continuations );
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

        if( t instanceof IRFunc )
        {
            stack.push( t.body );
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

function isAppLike( term: IRTerm ): term is IRApp | IRCase
{
    return (
        term instanceof IRApp ||
        isCaseConstrApp( term )
    );
}

function getMultiAppArgsAndBody( term: IRTerm ): [ args: IRTerm[], body: IRTerm, arity: number ]
{
    let args: IRTerm[] = [];
    let body: IRTerm = term;
    let arity: number = 0;

    /*
    while(
        term instanceof IRApp &&
        term.fn instanceof IRFunc &&
        term.fn.arity === 1
    )
    {
        // letted terms
        // [(lam a [(lam b [(lam c ... ))) c] b] a] :: []
        // [(lam b [(lam c ... ))) c] b] :: [a]
        // [(lam c ... ) c] :: [a, b]
        // ... :: [a, b, c]
        
        args.push( term.arg );
        term = term.fn.body as any;
        // arity++;
        body = term;
        continue;
    }

    arity = args.length;

    // if we started with letted or hoisted
    // continue looking for consecutive applications or cases
    if( arity > 0 )
    {
        const [ nextArgs, nextBody, nextArity ] = getMultiAppArgsAndBody( body );
        return [ args.concat( nextArgs ), nextBody, arity + nextArity ];
    }
    //*/

    // else we look for consecutive applications or cases
    while( term instanceof IRApp )
    {
        /*
        consecutive applications look like:
        [
            [
                [
                    (lam a (lam b (lam c ... )))
                a]
            b]
        c]
        but the equivalent IRCase looks like:
        (case
            (constr 0 a b c)
            (lam a (lam b (lam c ... )))
        )
        so we need to reverse the order of the args
        since we start from the outermost application
        (in order, we encounter from the top: c => b => a)
        */
        args.unshift( term.arg );
        term = term.fn as any;
        // arity++;
        body = term;
    };
    arity = args.length;

    if( arity === 0 ) return [ args, body, arity ];

    const [ nextArgs, nextBody, nextArity ] = getMultiAppArgsAndBody( body );
    return [ args.concat( nextArgs ), nextBody, arity + nextArity ];
}

function isCaseConstrApp( term: IRTerm ): boolean
{
    return (
        term instanceof IRCase &&
        term.continuations.length === 1 &&
        term.constrTerm instanceof IRCase
    );
}

function isIdLike( term: IRTerm ): boolean
{
    return (
        term instanceof IRFunc &&
        term.arity === 1 &&
        term.body instanceof IRVar &&
        Number( term.body.dbn ) === 0
    );
}

function getArityOfTerm( term: IRTerm ): number
{
    let arity = 0;
    while(
        term instanceof IRApp ||
        term instanceof IRFunc ||
        term instanceof IRNative ||
        term instanceof IRVar ||
        term instanceof IRForced ||
        term instanceof IRDelayed
    )
    {
        if( term instanceof IRForced )
        {
            term = term.forced;
            continue;
        }
        if( term instanceof IRDelayed )
        {
            term = term.delayed;
            continue;
        }

        if( term instanceof IRApp )
        {
            arity--;
            term = term.fn;
            continue;
        }
        if( term instanceof IRFunc )
        {
            arity += term.arity;
            term = term.body;
            continue;
        }
    }
    return arity;
}