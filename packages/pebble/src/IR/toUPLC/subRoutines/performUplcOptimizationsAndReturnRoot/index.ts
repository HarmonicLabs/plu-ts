import { get } from "http";
import { IRConst, IRConstr, IRError, IRNative } from "../../../IRNodes";
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
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { CompilerOptions, CompilerUplcOptimizations, isDebugUplcOptimizations } from "../../CompilerOptions";
import { expandFuncsAndReturnRoot, getExpandedIRFunc } from "./expandFuncsAndReturnRoot";

type StackEntry = [ term: IRTerm, dbn: number ];

export function performUplcOptimizationsAndReturnRoot(
    root: IRTerm,
    options: CompilerOptions
): IRTerm
{
    const opts = options.uplcOptimizations;
    if( isDebugUplcOptimizations( opts ) ) return root;

    const {
        groupApplications,
        inlineSingleUse: shouldInlineSingleUse,
        simplifyWrappedPartialFuncApps,
        removeForceDelay
    } = opts;

    root = expandFuncsAndReturnRoot( root );
    const stack: StackEntry[] = [ [ root, 0 ] ];

    while( stack.length > 0 )
    {
        let [ t, dbn ] = stack.pop()!;

        if( t instanceof IRApp )
        {
            if( isIdLike( t.fn ) )
            {
                if( t.parent ) _modifyChildFromTo( t.parent, t, t.arg );
                else root = t.arg;
                stack.push( [ t.arg, dbn ] );
                continue;
            }

            if( !groupApplications )
            {
                stack.push(
                    [ t.fn, dbn ],
                    [ t.arg, dbn ],
                );
                continue;
            }

            let args: IRTerm[];
            let body: IRTerm;

            /*
            // can't figure how to make it work
            [ args, body ] = groupIndipendentLets( t, dbn );

            if( args.length >= 2 )
            {
                let newNode = body;
                for( let i = args.length - 1; i >= 0; i-- )
                {
                    // apply as normal apps, not case/constr
                    // so we can further group if the body is directly applications
                    newNode = new IRApp( newNode, args[i] );
                }

                // overwrite original 
                if( t.parent ) _modifyChildFromTo( t.parent, t, newNode );
                else root = newNode;

                // reanalyze this new node to group using case/constr
                stack.push([ newNode, dbn ]);
                continue;
            }
            //*/

            [ args, body ] = getMultiAppArgsAndBody( t );

            if( args.length <= 2 )
            {
                stack.push(
                    [ t.fn, dbn ],
                    [ t.arg, dbn ],
                );
                continue;
            }

            const newNode = new IRCase(
                new IRConstr( 0, args ),
                [ body ]
            );
            stack.push([ body, dbn ]);

            if( t.parent ) _modifyChildFromTo( t.parent, t, newNode );
            else root = newNode;

            continue;
        }

        if( t instanceof IRCase )
        {
            stack.push(
                [ t.constrTerm, dbn ], 
                ...mapArrayLike( t.continuations, ( c ) => [ c, dbn ] as StackEntry )
            );
            continue;
        }
        if( t instanceof IRConstr )
        {
            // stack.push( ...t.fields );
            stack.push( ...mapArrayLike( t.fields, ( f ) => [ f, dbn ] as StackEntry ) );
            continue;
        }

        if( t instanceof IRDelayed )
        {
            stack.push([ t.delayed, dbn ]);
            continue;
        }

        if( t instanceof IRForced )
        {
            
            stack.push([ t.forced, dbn ]);
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push([ t.body, dbn + t.arity ]);
            continue;
        }

        if(
            t instanceof IRRecursive ||
            t instanceof IRHoisted ||
            t instanceof IRLetted ||
            t instanceof IRSelfCall
        ) throw new Error("Unexpected term while performing uplc optimizations");

        if(
            t instanceof IRVar
            || t instanceof IRNative
            || t instanceof IRConstr
            || t instanceof IRConst
            || t instanceof IRError
        ) continue; // leaf nodes

        const tsEnsureExhaustiveCheck: never = t;
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

function getMultiAppArgsAndBody( term: IRTerm ): [ args: IRTerm[], body: IRTerm ]
{
    let args: IRTerm[] = [];
    let body: IRTerm = term;

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

    return [ args, body ];
    // if( args.length === 0 ) return [ args, body ];

    // const [ nextArgs, nextBody ] = getMultiAppArgsAndBody( body, dbn );
    // return [ args.concat( nextArgs ), nextBody ];
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
        term.params.length === 1 &&
        term.body instanceof IRVar &&
        term.body.name === term.params[0]
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