import BasePlutsError from "../../../errors/BasePlutsError";
import ObjectUtils from "../../../utils/ObjectUtils";
import { CurriedFn, curry } from "../../../utils/ts/combinators";
import Application from "../../UPLC/UPLCTerms/Application";
import Delay from "../../UPLC/UPLCTerms/Delay";
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import Force from "../../UPLC/UPLCTerms/Force";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";
import PType from "../PType";
import PDelayed from "../PTypes/PDelayed";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import Type, { ToPType, ToTermArrNonEmpty, TermType, ConstantableTermType, AliasTermType } from "../Term/Type/base";
import Term from "../Term";
import JsRuntime from "../../../utils/JsRuntime";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import { typeExtends } from "../Term/Type/extension";
import { isLambdaType, isDelayedType } from "../Term/Type/kinds";
import { termTypeToString } from "../Term/Type/utils";
import applyLambdaType from "../Term/Type/applyLambdaType";
import UPLCTerm from "../../UPLC/UPLCTerm";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import { getNRequiredForces } from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import addUtilityForType, { UtilityTermOf } from "../stdlib/UtilityTerms/addUtilityForType";
import punsafeConvertType from "./punsafeConvertType";
import TermAlias from "../stdlib/UtilityTerms/TermAlias";
import { PValue } from "../API";


function isIdentityUPLC( uplc: UPLCTerm ): uplc is Lambda
{
    return (
        ( uplc instanceof HoistedUPLC && isIdentityUPLC( uplc.UPLC ) ) || 
        (
            uplc instanceof Lambda && 
            uplc.body instanceof UPLCVar &&
            uplc.body.deBruijn.asBigInt === BigInt( 0 )
        )
    );
}

export type PappResult<Output extends PType> =
    Output extends PLam<infer OutIn extends PType, infer OutOut extends PType> ?
        Term<PLam<OutIn,OutOut>>
        & {
            $: ( someInput: Term<OutIn> ) => PappResult<OutOut>
        } :
    UtilityTermOf<Output>

/**
 * 
 * @param {Term<PLam<Input, Output>>} a Term that evalueates to an UPLC function ( type: ```Type.Lambda( inputT, outputT )``` ) 
 * @param {Term<Input>} b the argument of to provide to the first parameter 
 * @returns {Term<Output>} the result of the calculation
 * 
 * if the type of the output extends the type ```Type.Lambda( Type.Any, Type.Any )```
 */
export function papp<Input extends PType, Output extends PType>( a: Term<PLam<Input,Output>>, b: Term<Input> )
    : PappResult<Output>
{
    let lambdaType: TermType = a.type;

    if(!( isLambdaType( lambdaType ) )) throw JsRuntime.makeNotSupposedToHappenError(
        "a term not representing a Lambda (aka. Type.Lambda) was passed to an application"
    );

    JsRuntime.assert(
        typeExtends( b.type, lambdaType[ 1 ] ),
        "while applying 'Lambda'; unexpected type of input; it should be possible to assign the input to \"" + termTypeToString( lambdaType[1] ) +
        "\"; received input was of type: \"" + termTypeToString( b.type ) + "\""
    );

    const outputType = applyLambdaType( lambdaType, b.type );
    const outputTerm: any = addUtilityForType( outputType )(
        new Term(
            outputType,
            dbn => {
                const funcUPLC = a.toUPLC( dbn );
                if( funcUPLC instanceof ErrorUPLC ) return funcUPLC;
                const argUPLC  = b.toUPLC( dbn );
                if( argUPLC instanceof ErrorUPLC ) return argUPLC;

                // omit id function
                if( isIdentityUPLC( funcUPLC ) ) return argUPLC;

                const app = new Application(
                    funcUPLC,
                    argUPLC
                );

                return app; 
            }
        ) as any
    );

    if( isLambdaType( outputTerm.type ) && ( !ObjectUtils.hasOwn( outputTerm, "$" ) ))
        // defined "$" property can be overridden but not deleted
        // override is necessary to allow a more specific implementation
        // 
        // example is for lazy builtins such as ```pif``` that need to modify the input
        // wrapping it into a "Delay"
        return ObjectUtils.defineNonDeletableNormalProperty(
            outputTerm,
            "$",
            ( someInput: any ) => papp( outputTerm as any, someInput )
        ) as any;
    
    return outputTerm as any;
}

export function plam<A extends TermType, B extends TermType >( inputType: A, outputType: B )
    : ( termFunc : 
        ( input:  UtilityTermOf<ToPType<A>>
        ) => Term<ToPType<B>> 
    ) => PappResult<PLam<ToPType<A>,ToPType<B>>>
{
    return ( termFunc: ( input: UtilityTermOf<ToPType<A>> ) => Term<ToPType<B>> ): PappResult<PLam<ToPType<A>,ToPType<B>>> =>
    {
        const lambdaTerm  = new Term<PLam<ToPType<A>,ToPType<B>>>(
            Type.Lambda( inputType, outputType ),
            dbn => {
                const thisLambdaPtr = dbn + BigInt( 1 );

                const boundVar = new Term<ToPType<A>>(
                    inputType as any,
                    dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr )
                );
                
                const body = termFunc( addUtilityForType( inputType )( boundVar ) as any );

                if( !(body instanceof Term) ) console.log( body );
                // here the debruijn level is incremented
                return new Lambda( body.toUPLC( thisLambdaPtr ) );
            }
        );
    
        // allows ```lambdaTerm.$( input )``` syntax
        // rather than ```papp( lambdaTerm, input )```
        // preserving Term Type
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: UtilityTermOf<ToPType<A>> ) => papp( lambdaTerm, input )
        ) as any;
    };
}

// type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
type PFnFromTypes<Ins extends [ TermType, ...TermType[] ], Out extends TermType> =
    Ins extends [ infer T extends TermType ] ?
        PLam<ToPType<T>, ToPType<Out>> :
    Ins extends [ infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ?
        PLam<ToPType<T>, PFnFromTypes<RestTs, Out>>:
    never

export type TermFnFromTypes<Ins extends [ TermType, ...TermType[] ], Out extends TermType> =
    Ins extends [ infer T extends TermType ] ? Term<PLam<ToPType<T>, ToPType<Out>>> & { $: ( input: Term<ToPType<T>> ) => UtilityTermOf<ToPType<Out>> } :
    Ins extends [ infer T extends TermType, ...infer RestIns extends [ TermType, ...TermType[] ] ] ?
        Term<PLam<ToPType<T>,PFnFromTypes<RestIns, Out>>>
        & { $: ( input: Term<ToPType<T>> ) => TermFnFromTypes< RestIns, Out > } :
    never

type TsTermFunctionArgs<InputsTypes extends [ TermType, ...TermType[] ]> =
    InputsTypes extends [] ? never :
    InputsTypes extends [ infer T extends TermType ] ? [ a: UtilityTermOf<ToPType<T>> ] :
    InputsTypes extends [ infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ a: UtilityTermOf<ToPType<T>>, ...bs: TsTermFunctionArgs<RestTs> ] :
    never;

export type TsTermFunction<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType> = 
    (...args: TsTermFunctionArgs<InputsTypes> )
        // important that returns `Term` and NOT `UtilityTermOf`
        // because it allows ANY term to be the result and the plu-ts handles the rest
        => Term<ToPType<OutputType>>

export function pfn<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType>( inputsTypes: InputsTypes, outputType: OutputType )
    : ( termFunction: TsTermFunction<InputsTypes,OutputType> ) => 
        TermFnFromTypes<InputsTypes, OutputType>
{
    function plamNCurried(
        curriedFn:
            CurriedFn<
                ToTermArrNonEmpty<InputsTypes>,
                Term<ToPType<OutputType>>
            >,
        nMissingArgs: number
    ): TermFnFromTypes<InputsTypes, OutputType>
    {
        if( nMissingArgs === 1 ) return plam( inputsTypes[ inputsTypes.length - 1 ], outputType )( curriedFn as any ) as any;

        const currentInputIndex = inputsTypes.length - nMissingArgs;

        return plam(
            inputsTypes[ currentInputIndex ],
            Type.Fn( inputsTypes.slice( currentInputIndex + 1 ) as any, outputType )
        )(
            ( someInput: Term<PType> ) => plamNCurried( curriedFn( someInput ) as any , nMissingArgs - 1 )
        ) as any;
    }

    return (( termFunction: ( ...args: ToTermArrNonEmpty<InputsTypes> ) => Term<ToPType<OutputType>> ) =>
    {
        if( termFunction.length <= 0 )
            throw new BasePlutsError("'(void) => any' cannot be translated to a Pluts function");

        JsRuntime.assert(
            termFunction.length === inputsTypes.length,
            "number of inputs of the function doesn't match the number of types specified for the input"
        );

        return plamNCurried(
            curry( termFunction ),
            termFunction.length
        );
    }) as any;
}


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

    return punsafeConvertType( papp( Z, fnBody ), fnBody.type[2] as TermType ) as any;
}

type TsTermRecursiveFunctionArgs<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType> =
 InputsTypes extends [] ? never :
 InputsTypes extends [ infer T extends TermType ] ? [ self: TsTermFunction<InputsTypes, OutputType>, arg: Term<ToPType<T>> ] :
 InputsTypes extends [ infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ?
     [ arg: Term<ToPType<T>>, ...args: TsTermRecursiveFunctionArgs<RestTs, OutputType> ] :
 never;

type TsTermRecursiveFunction<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType> =
 (...args: TsTermRecursiveFunctionArgs<InputsTypes, OutputType> ) => Term<ToPType<OutputType>>

export function precursiveFn<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType>( inputsTypes: InputsTypes, outputType: OutputType )
 : ( termFunction: TsTermRecursiveFunction<InputsTypes,OutputType> ) => 
    TermFnFromTypes< InputsTypes, OutputType>
{
 return ( termFn ) => precursive(
     pfn([
         Type.Fn( inputsTypes, outputType ),
         ...inputsTypes
     ],
     outputType
     )( termFn as any ) as  any
 ) as any
}

export function phoist<PInstance extends PType, SomeExtension extends {} >( closedTerm: Term<PInstance> & SomeExtension ): Term<PInstance> & SomeExtension
{
    /*
    the implementation has been moved to a method of the term
    since all 'phoist' is doing is wrapping whatever UPLC the 'Term' represent
    into an 'HoistedUPLC'

    however proevious implementaiton achieved this by creating a new term and then **copying** eventual extension

    this was a problem since the extension methods are defined using the **raw** UPLC rather than the hoisted
    causing the hoisted result not to be actually hoisted if accessed using the methods

    moving the "wrapping" of the 'toUPLC' method inside the term, preserves the same 'Term' object
    but the same 'Term' object is now properly hoisted

    this also removes the `O(n)` operation of copying the methods; since the methods are already there
    */
    (closedTerm as any).hoist();
    return closedTerm;
}

export function pdelay<PInstance extends PType>(toDelay: Term<PInstance>): Term<PDelayed<PInstance>>
{
    return new Term(
        Type.Delayed( toDelay.type ),
        (dbn) => {
            return new Delay(
                toDelay.toUPLC( dbn )
            );
        }
    );
}

export function pforce<PInstance extends PType >
    ( toForce: Term<PDelayed<PInstance>> | Term<PInstance> ): UtilityTermOf<PInstance>
{
    const outType = isDelayedType( toForce.type ) ? toForce.type[ 1 ] : toForce.type 

    return addUtilityForType( outType )(
        new Term(
            outType as any,
            (dbn) => {
                const toForceUPLC = toForce.toUPLC( dbn );

                // if directly applying to Delay UPLC just remove the delay
                // example:
                // (force (delay (con int 11))) === (con int 11)
                if( toForceUPLC instanceof Delay )
                {
                    return toForceUPLC.delayedTerm;
                }

                // any other case
                return new Force(
                    toForceUPLC
                );
            }
        )
    ) as any;
}

export function plet<PVarT extends PType, SomeExtension extends object>( varValue: Term<PVarT> & SomeExtension )
{
    type TermPVar = Term<PVarT> & SomeExtension;
    
    const continuation = <PExprResult extends PType>( expr: (value: TermPVar) => Term<PExprResult> ): Term<PExprResult> => {

        // only to extracts the type; never compiled
        const outType = expr(
            addUtilityForType( varValue.type )(
                new Term(
                    varValue.type,
                    _dbn => new UPLCVar( 0 ) // mock variable
                ) as any
            ) as any
        ).type;

        // return papp( plam( varValue.type, outType )( expr as any ), varValue as any ) as any;
        return new Term(
            outType,
            dbn => {
                const arg = varValue.toUPLC( dbn );

                if(
                    // inline variables; no need to add an application since already in scope
                    arg instanceof UPLCVar ||
                    (
                        // builtins with less than 2 forces do take less space inlined
                        // if it has two forces it is convenient to inline only if used once
                        // if you are using a variable "pletted" once you shouldn't use "plet"
                        arg instanceof Builtin && getNRequiredForces( arg.tag ) < 2
                    )
                )
                {
                    console.log("inlining")
                    return expr( varValue ).toUPLC( dbn );
                }

                return new Application(
                    new Lambda(
                        expr( new Term(
                            varValue.type,
                            varAccessDbn => new UPLCVar( varAccessDbn - ( dbn + BigInt(1) ) ) // point to the lambda generated here
                        ) as TermPVar ).toUPLC( ( dbn + BigInt(1) ) )
                    ),
                    arg
                )
            }
        );
    }
    return {
        in: continuation
    };
}

export function perror<T extends TermType>( type: T , msg: string | undefined = undefined, addInfos: object | undefined = undefined): Term<ToPType<T>>
{
    return new Term(
        type as any,
        _dbn => new ErrorUPLC( msg, addInfos )
    );
}
