import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRFunc } from "../../../IR/IRNodes/IRFunc";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { IRRecursive } from "../../../IR/IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";
import { IRVar } from "../../../IR/IRNodes/IRVar";
import { IRTerm } from "../../../IR/IRTerm";
import { _modifyChildFromTo } from "../../../IR/toUPLC/_internal/_modifyChildFromTo";
import { sanifyTree } from "../../../IR/toUPLC/subRoutines/sanifyTree";
import { getChildren } from "../../../IR/tree_utils/getChildren";
import { assert } from "../../../utils/assert";
import { PType } from "../../PType";
import { PFn, PLam } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, lam, tyVar, typeExtends } from "../../../type_system";


/**
 * for reference the "Z combinator in js": https://medium.com/swlh/y-and-z-combinators-in-javascript-lambda-calculus-with-real-code-31f25be934ec
 * 
 * ```js
 *  const Zcombinator = (
 *  	Z => (
 *  		toMakeRecursive => Z( value => toMakeRecursive(toMakeRecursive)(value) )
 *  	)( toMakeRecursive => Z( value => toMakeRecursive(toMakeRecursive)(value)) )
 *  );
 * ```
 * of type
 * ```js
 * Z => toMakeRecursive => value => result
 * ```
 * and ```toMakeRecursive``` has to be of type
 * ```js
 * self => value => result
 * ```
 */
export function _precursive<A extends PType, B extends PType>
( fnBody:
    Term<PLam<
        PLam<A,B>,  // self
        PLam<A,B>>  // the actual function 
    >
): Term<PFn<[ A ], B>>
{
    const a = tyVar("recursive_fn_a");
    const b = tyVar("recursive_fn_b");

    assert(
        typeExtends(
            fnBody.type,
            lam(
                lam( a, b ),
                lam( a, b )
            )
        ),
        "passed function body cannot be recursive; "+
        "the first argument is not a lambda or it doesn't take any input"
    );

    const recursiveFn = new Term(
        fnBody.type[2] as TermType,
        (cfg, dbn) => {
            const fnBodyIr = assertArity2AndRemoveFirst( fnBody.toIR( cfg, dbn ) );

            replaceSelfVars( fnBodyIr );
            
            return new IRRecursive( fnBodyIr );
            // return new IRApp(
            //     IRNative.z_comb,
            //     fnBodyIr
            // )
        }
    )

    return ( recursiveFn ) as any;
}

function assertArity2AndRemoveFirst( term: IRTerm ): IRFunc
{
    if(!( term instanceof IRFunc )) throw new Error("argument of precursive must be a function");

    if( term.arity >= 2 )
    {
        return new IRFunc(
            term.arity - 1,
            term.body
        );
    }
    // else term.arity === 1

    if(!( term.body instanceof IRFunc ))
    throw new Error("argument of precursive must be a function with arity >= 2");

    return term.body;
}

function replaceSelfVars( term: IRTerm, dbn: number = 0 ): void
{
    if( term instanceof IRVar )
    {
        if( term.dbn === dbn )
        {
            _modifyChildFromTo(
                term.parent,
                term,
                new IRSelfCall( dbn )
            );
        }
        return;
    }
    if(
        term instanceof IRFunc ||
        term instanceof IRRecursive
    ) return replaceSelfVars( term.body, dbn + term.arity );
    getChildren( term ).forEach( child => replaceSelfVars( child, dbn ) );
} 