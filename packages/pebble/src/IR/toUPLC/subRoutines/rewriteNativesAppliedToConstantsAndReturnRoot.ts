import { IRApp, IRCase, IRConst, IRConstr, IRFunc, IRHoisted, IRLetted, IRNative, IRVar } from "../../IRNodes";
import { IRNativeTag } from "../../IRNodes/IRNative/IRNativeTag";
import { IRTerm } from "../../IRTerm";
import { _ir_apps } from "../../tree_utils/_ir_apps";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { _compTimeDropN } from "./_comptimeDropN";

export function rewriteNativesAppliedToConstantsAndReturnRoot( term: IRTerm ): IRTerm
{
    // traverse the tree, find applications of natives to constants
    // and replace them with the optimized equivalent

    const stack: IRTerm[] = [ term ];
    while( stack.length > 0 )
    {
        const current = stack.pop()!;
        const parent = current.parent;
        const appTerms = _getApplicationTerms( current );

        if( !appTerms ) {
            stack.unshift( ...current.children() );
            continue;
        }
        if(!(
            appTerms.func instanceof IRNative
        )) {
            stack.unshift( ...current.children() );
            continue;
        }

        const { func, args } = appTerms;
        const [ fstArg, ...restArgs ] = args;

        if(
            isId( func )
            && restArgs.length === 0
        ) {
            if( parent ) {
                _modifyChildFromTo( parent, current, fstArg );
            } else {
                term = fstArg;
                term.parent = undefined;
            }
            stack.unshift( fstArg );
            continue;
        }

        if(!( fstArg instanceof IRConst )) {
            stack.unshift( ...current.children() );
            continue;
        }

        if(
            func.tag === IRNativeTag._dropList
            && typeof fstArg.value === "bigint"
        )
        {
            const newTerm = restArgs.length >= 1 ? _ir_apps(
                _compTimeDropN( fstArg.value ),
                ...(restArgs as [ IRTerm, ...IRTerm[] ]),
            ) : _compTimeDropN( fstArg.value );

            if( parent ) {
                _modifyChildFromTo( parent, current, newTerm );
            } else {
                term = newTerm;
                term.parent = undefined;
            }

            stack.unshift( newTerm );
            continue;
        }
    }

    return term;
}

interface ApplicationTerms {
    func: IRTerm,
    args: IRTerm[],
}

function _getApplicationTerms( term: IRTerm ): ApplicationTerms | undefined
{
    const args: IRTerm[] = [];
    while(
        term instanceof IRApp
        || term instanceof IRCase
        // go "through" letted and hoisted
        // || term instanceof IRLetted
        // || term instanceof IRHoisted
    ) {
        if( term instanceof IRApp ) {
            args.unshift( term.arg );
            term = term.fn;
            continue;
        }
        if( term instanceof IRCase ) {
            if(!(
                term.continuations.length === 1
                && term.constrTerm instanceof IRConstr
            )) continue;

            term = term.continuations[0];
            args.push( ...((term as IRCase).constrTerm as IRConstr).fields );
            continue;
        }
        // if( term instanceof IRLetted ) term = term.value;
        // else if( term instanceof IRHoisted ) term = term.hoisted;
    }
    if( args.length === 0 ) return undefined;
    return {
        func: term,
        args,
    };
}

function isId( term: IRTerm ): boolean
{
    while(
        term instanceof IRHoisted
        || term instanceof IRLetted
    ) {
        if( term instanceof IRHoisted ) term = term.hoisted;
        else if( term instanceof IRLetted ) term = term.value;
    }
    return (
        (
            term instanceof IRNative
            && term.tag === IRNativeTag._id
        ) || (
            term instanceof IRFunc
            && term.arity === 1
            && term.body instanceof IRVar
            && Number( term.body.dbn ) === 0
        )
    );
}