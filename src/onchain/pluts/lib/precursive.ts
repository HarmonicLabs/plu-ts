import JsRuntime from "../../../utils/JsRuntime";
import { Application } from "../../UPLC/UPLCTerms/Application";
import { HoistedUPLC } from "../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../PType";
import { PLam, TermFn } from "../PTypes";
import { Term, Type, typeExtends, TermType } from "../Term";
import { papp } from "./papp";
import { punsafeConvertType } from "./punsafeConvertType";


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
   const a = Type.Var("recursive_fn_a");
   const b = Type.Var("recursive_fn_b");

   JsRuntime.assert(
       typeExtends(
           fnBody.type,
           Type.Lambda(
               Type.Lambda( a, b ),
               Type.Lambda( a, b )
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

   const Z = new Term<
           PLam<
               PLam<
                   PLam<PType,PType>,
                   PLam<PType,PType>
               >,
           PLam<PType,PType>
           >
       >(
           Type.Lambda(
               Type.Lambda( Type.Lambda( a, b ), Type.Lambda( a, b ) ),
               Type.Lambda( a, b ),
           ),
           _dbn => ZUPLC
       );

   return punsafeConvertType( papp( Z, fnBody as any ), fnBody.type[2] as TermType ) as any;
}
