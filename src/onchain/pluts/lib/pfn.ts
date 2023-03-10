import { BasePlutsError } from "../../../errors/BasePlutsError";
import JsRuntime from "../../../utils/JsRuntime";
import { CurriedFn, curry } from "../../../utils/ts/combinators";
import { PType } from "../PType";
import { PLam } from "../PTypes";
import { Term, ToTermArrNonEmpty } from "../Term";
import { ToPType } from "../type_system/ts-pluts-conversion";
import { TermType, fn } from "../type_system/types";
import { UtilityTermOf } from "./addUtilityForType";
import { PappArg } from "./pappArg";
import { plam } from "./plam";

// type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
type PFnFromTypes<Ins extends [ TermType, ...TermType[] ], Out extends TermType> =
    Ins extends [ infer T extends TermType ] ?
        PLam<ToPType<T>, ToPType<Out>> :
    Ins extends [ infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ?
        PLam<ToPType<T>, PFnFromTypes<RestTs, Out>>:
    never

type TermFnFromTypes<Ins extends [ TermType, ...TermType[] ], Out extends TermType> =
    Ins extends [ infer T extends TermType ] ? Term<PLam<ToPType<T>, ToPType<Out>>> & { $: ( input: PappArg<ToPType<T>> ) => UtilityTermOf<ToPType<Out>> } :
    Ins extends [ infer T extends TermType, ...infer RestIns extends [ TermType, ...TermType[] ] ] ?
        Term<PLam<ToPType<T>,PFnFromTypes<RestIns, Out>>>
        & { $: ( input: PappArg<ToPType<T>> ) => TermFnFromTypes< RestIns, Out > } :
    never

type TsTermFuncArg<PTy extends PType> =
    ( PTy extends PLam<infer PIn extends PType, infer POut extends PTy> ?
        Term<PLam<PIn,POut>> & {
            $: ( input: Term<PIn> ) => UtilityTermOf<POut>
        }:
    UtilityTermOf<PTy> ) extends infer PRes ? PRes & Term<PTy> : never

type TsTermFunctionArgs<InputsTypes extends [ TermType, ...TermType[] ]> =
    InputsTypes extends [] ? never :
    InputsTypes extends [ infer T extends TermType ] ? [ TsTermFuncArg<ToPType<T>> ] :
    InputsTypes extends [ infer T extends TermType, ...infer RestTs extends [ TermType, ...TermType[] ] ] ? [ TsTermFuncArg<ToPType<T>>, ...TsTermFunctionArgs<RestTs> ] :
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
        if( nMissingArgs === 1 ) 
        return plam( inputsTypes[ inputsTypes.length - 1 ], outputType )
            // @ts-ignore Type instantiation is excessively deep and possibly infinite.
            ( curriedFn as any ) as any;

        const currentInputIndex = inputsTypes.length - nMissingArgs;

        return plam(
            inputsTypes[ currentInputIndex ],
            fn( inputsTypes.slice( currentInputIndex + 1 ) as [ TermType, ...TermType[] ], outputType ) as any
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