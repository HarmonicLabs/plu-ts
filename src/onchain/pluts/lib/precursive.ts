import JsRuntime from "../../../utils/JsRuntime";
import { Application } from "../../UPLC/UPLCTerms/Application";
import { HoistedUPLC } from "../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../PType";
import { PLam, TermFn } from "../PTypes";
import { Term } from "../Term";
import { TermType, lam, tyVar, typeExtends } from "../type_system";
import { addUtilityForType } from "./addUtilityForType";


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
   const a = tyVar("recursive_fn_a");
   const b = tyVar("recursive_fn_b");

   JsRuntime.assert(
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

   const innerZ = new Lambda( // toMakeRecursive
       new Application(
           new UPLCVar( 1 ), // Z
           new Lambda( // value
               new Application(
                   new Application(
                       new UPLCVar( 1 ), // toMakeRecursive
                       new UPLCVar( 1 )  // toMakeRecursive
                   ),
                   new UPLCVar( 0 ) // value
               )
           )
       )
   );

   /** 
    * @hoisted
    **/
   const ZUPLC = new HoistedUPLC(
       new Lambda( // Z
           new Application(
               innerZ,
               innerZ
           )
       )
   );

   const recursiveFn = new Term(
        fnBody.type[2] as TermType,
        dbn => new Application(
            ZUPLC,
            fnBody.toUPLC(dbn)
        )
   )

   return addUtilityForType( fnBody.type[2] as TermType )( recursiveFn ) as any;
}
