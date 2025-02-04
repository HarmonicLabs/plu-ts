import { BasePlutsError } from "../../utils/BasePlutsError";
import { assert } from "../../utils/assert";
import { PType } from "../PType";
import { PLam } from "../PTypes";
import { Term, ToTermArrNonEmpty } from "../Term";
import { ToPType } from "../../type_system/ts-pluts-conversion";
import { TermType, fn } from "../../type_system/types";
import { UtilityTermOf } from "./std/UtilityTerms/addUtilityForType";
import { PappArg } from "./pappArg";
import { plam } from "./plam";
import { CurriedFn, curry } from "../../utils/combinators";
import { getCallStackAt } from "../../utils/getCallStackAt";


// type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
type PFnFromTypes<Ins extends [ TermType, ...TermType[] ], Out extends TermType> =
    Ins extends [ infer T extends TermType ] ?
        PLam<ToPType<T>, ToPType<Out>> :
    Ins extends [ infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ?
        PLam<ToPType<T>, PFnFromTypes<RestTs, Out>>:
    never

type TermFnFromTypes<Ins extends [ TermType, ...TermType[] ], Out extends TermType> =
    Ins extends [ infer T extends TermType ] ? 
        Term<PLam<ToPType<T>, ToPType<Out>>> & { 
            $: ( input: PappArg<ToPType<T>> ) => UtilityTermOf<ToPType<Out>>
        } :
    Ins extends [ infer T extends TermType, ...infer RestIns extends [ TermType, ...TermType[] ] ] ?
        Term<PLam<ToPType<T>,PFnFromTypes<RestIns, Out>>> & {
            $: ( input: PappArg<ToPType<T>> ) => TermFnFromTypes< RestIns, Out >
        } :
    never

/*
type TsTermFuncArg<PTy extends PType> =
    PTy extends PLam<infer PIn extends PType, infer POut extends PTy> ?
        Term<PLam<PIn,POut>> & {
            $: ( input: Term<PIn> ) => UtilityTermOf<POut>
        }:
        UtilityTermOf<PTy>
//*/

type TsTermFunctionArgs<InputsTypes extends [ TermType, ...TermType[] ]> =
    InputsTypes extends [] ? never :
    InputsTypes extends [ infer T extends TermType ] ? [ UtilityTermOf<ToPType<T>> ] :
    InputsTypes extends [ 
        infer T extends TermType, 
        ...infer RestTs extends [ TermType, ...TermType[] ] 
    ] ? [ UtilityTermOf<ToPType<T>>, ...TsTermFunctionArgs<RestTs> ] :
    never;

export type TsTermFunction<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType> = 
    (...args: TsTermFunctionArgs<InputsTypes> )
        // important that returns `Term` and NOT `UtilityTermOf`
        // because it allows ANY term to be the result and the plu-ts handles the rest
        => Term<ToPType<OutputType>>

export function pfn<InputsTypes extends [ TermType, ...TermType[] ], OutputType extends TermType>( inputsTypes: InputsTypes, outputType: OutputType )
    : ( termFunction: TsTermFunction<InputsTypes,OutputType>, funcName?: string | undefined ) => 
        TermFnFromTypes<InputsTypes, OutputType>
{
    function plamNCurried(
        curriedFn:
            CurriedFn<
                ToTermArrNonEmpty<InputsTypes>,
                Term<ToPType<OutputType>>
            >,
        nMissingArgs: number,
        func_name: string | undefined
    ): TermFnFromTypes<InputsTypes, OutputType>
    {
        if( nMissingArgs === 1 ) 
        return plam( inputsTypes[ inputsTypes.length - 1 ], outputType )
            ( curriedFn as any, func_name ) as any;

        const currentInputIndex = inputsTypes.length - nMissingArgs;

        return plam(
            inputsTypes[ currentInputIndex ],
            fn( inputsTypes.slice( currentInputIndex + 1 ) as [ TermType, ...TermType[] ], outputType ) as any
        )(
            ( someInput: Term<PType> ) => plamNCurried( curriedFn( someInput ) as any , nMissingArgs - 1, func_name ),
            func_name ?? "curried_lam"
        ) as any;
    }

    return ((
        termFunction: ( ...args: ToTermArrNonEmpty<InputsTypes> ) => Term<ToPType<OutputType>>,
        funcName?: string
    ) =>
    {
        if( termFunction.length <= 0 )
            throw new BasePlutsError("'(void) => any' cannot be translated to a Pluts function");

        assert(
            termFunction.length === inputsTypes.length,
            "number of inputs of the function doesn't match the number of types specified for the input"
        );

        let func_name: string | undefined = undefined; 
        func_name = 
            typeof funcName === "string" ? funcName :
            termFunction.name !== "" ? termFunction.name :
            getCallStackAt( 3, { 
                tryGetNameAsync: true,
                onNameInferred: inferred => func_name = inferred 
            })?.inferredName;

        return plamNCurried(
            curry( termFunction ),
            termFunction.length,
            func_name
        );
    }) as any;
}

/*
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
        if( nMissingArgs === 1 ) 
        return plam( inputsTypes[ inputsTypes.length - 1 ], outputType )
            ( curriedFn as any ) as any;

        const currentInputIndex = inputsTypes.length - nMissingArgs;

        return plam(
            inputsTypes[ currentInputIndex ],
            fn( inputsTypes.slice( currentInputIndex + 1 ) as [ TermType, ...TermType[] ], outputType ) as any
        )(
            ( someInput: Term<PType> ) => plamNCurried( curriedFn( someInput ) as any , nMissingArgs - 1 )
        ) as any;
    }

    return ((
        termFunction: ( ...args: ToTermArrNonEmpty<InputsTypes> ) => Term<ToPType<OutputType>>,
        funcName?: string
    ) =>
    {
        if( termFunction.length <= 0 )
            throw new BasePlutsError("'(void) => any' cannot be translated to a Pluts function");

        assert(
            termFunction.length === inputsTypes.length,
            "number of inputs of the function doesn't match the number of types specified for the input"
        );

        let func_name: string | undefined = undefined; 
        func_name = 
            typeof funcName === "string" ? funcName :
            termFunction.name !== "" ? termFunction.name :
            getCallStackAt( 3, { 
                tryGetNameAsync: true,
                onNameInferred: inferred => func_name = inferred 
            })?.inferredName;

        const lambdaTerm  = new Term<PLam<PType,PType>>(
            fn( inputsTypes, outputType ) as any,
            dbn => {
                const thisLambdaPtr = dbn + BigInt( 1 );

                const boundVars = inputsTypes.map( inT => {

                    const boundVar = new Term<PType>(
                        inT,
                        dbnAccessLevel => new IRVar( dbnAccessLevel - thisLambdaPtr )
                    );

                    return addUtilityForType( inT )( boundVar ); 
                });

                const body = termFunction( ...boundVars as any );

                // here the debruijn level is incremented
                return new IRFunc( termFunction.length, body.toIR( cfg, thisLambdaPtr ), func_name );
            }
        );

        defineReadOnlyHiddenProperty(
            lambdaTerm, "unsafeWithInputOfType",
            ( inT: TermType ) => {

                const newInsTys = inputsTypes.map( cloneTermType );
                newInsTys[0] = inT;

                return new Term<PLam<PType,PType>>(
                    fn( newInsTys as any, outputType ) as any,
                    (cfg, dbn) => {
                        const thisLambdaPtr = dbn + BigInt( 1 );

                        const boundVars = inputsTypes.map( inT => {

                            const boundVar = new Term<PType>(
                                inT,
                                (cfg, dbnAccessLevel) => new IRVar( dbnAccessLevel - thisLambdaPtr )
                            );

                            defineReadOnlyHiddenProperty(
                                boundVar,
                                "__isDynamicPair",
                                includesDynamicPairs( inT )
                            );

                            return addUtilityForType( inT )( boundVar ); 
                        });

                        const body = termFunction( ...boundVars as any );

                        // here the debruijn level is incremented
                        return new IRFunc( termFunction.length, body.toIR( cfg, thisLambdaPtr ), func_name );
                    }
                );
            }
        )

        // allows ```lambdaTerm.$( input )``` syntax
        // rather than ```papp( lambdaTerm, input )```
        // preserving Term Type
        return defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: Term<PType> ) => papp( lambdaTerm, input )
        ) as any;
    }) as any;
}
//*/