import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { assert } from "../../../utils/assert";
import { PType } from "../../PType";
import { PFn, PLam } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, lam, tyVar, typeExtends } from "../../type_system";


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
        dbn => new IRApp(
            IRNative.z_comb,
            fnBody.toIR( dbn )
        )
    )

    return ( recursiveFn ) as any;
}
