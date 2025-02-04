import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { assert } from "../../../utils/assert";
import { PType } from "../../PType";
import { PLam, TermFn } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, lam, tyVar, typeExtends } from "../../../type_system";
import { addUtilityForType } from "../std/UtilityTerms/addUtilityForType";
import { _precursive } from "./minimal";


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
export function precursive<A extends PType, B extends PType>
( fnBody:
    Term<PLam<
        PLam<A,B>,  // self
        PLam<A,B>>  // the actual function 
    >
): TermFn<[ A ], B >
{
    return addUtilityForType( fnBody.type[2] as TermType )( _precursive( fnBody ) ) as any;
}
