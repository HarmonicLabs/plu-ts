import type { PType } from "../../../../PType";
import { PAlias, PBool, PInt, PStruct } from "../../../../PTypes";
import { PFn } from "../../../../PTypes/PFn/PFn";
import type { PLam } from "../../../../PTypes/PFn/PLam";
import type { Term } from "../../../../Term";
import type { Methods, StructDefinition } from "../../../../../type_system/types";
import { PappArg } from "../../../pappArg";
import type { UtilityTermOf } from "../addUtilityForType";

export type LiftPMethod<PT extends PType, PrevPIns extends Term<PType>[] = []>
    = PT extends PLam<infer PIn extends PType, infer POut extends PType> ?
    (
        POut extends PLam<PType, PType> ?
        LiftPMethod<POut, [ ...PrevPIns, PappArg<PIn> ]> :
        ( ...args: [ ...PrevPIns, PappArg<PIn> ] ) => UtilityTermOf<POut>
    ) : UtilityTermOf<PT>

// type test_0 = LiftPMethod<PLam<PInt, PData>>
// type test_1 = LiftPMethod<PFn<[ PInt, PData ], PData>>
// type test_2 = LiftPMethod<PFn<[ PInt, PData ], PLam<PInt, PInt>>>

export type LiftTermMethod<TFn extends Term<PLam<PType,PType>>>
        // only infer `POut` because we assume `PIn` is the term using the method
        // TODO: filter out `PIn`s that are not of type of the term using the method (requires additional type prameter)
    = TFn extends Term<PLam<PType, infer POut extends PType>> ? LiftPMethod<POut> : never;

export type LiftMethods<SMethods extends Methods> = {
    readonly [ Method in keyof SMethods ]: LiftTermMethod<SMethods[Method]>
}


// type WithoutFirstPLam<PT extends PType>
//     = PT extends PLam<PType, infer POut extends PType> ? POut : PT;

type TermToMethod<T extends Term<PLam<PType,PType>>>
    = T extends Term<
        PLam<
            PType /* The term with the methods */,
            infer POut extends PType
        >
    > ? 
        (
            // Term is a function with at least two arguments
            // (that means at least one other argument must be passed)
            POut extends PLam<any, any> ?
            UtilityTermOf<POut> :
            // else
            // given the single input we have already somehting
            // "forwarded" to `LiftMethods` as a "getter" (because we don't want the additional "p" as prefix)
            never

            // UtilityTermOf<WithoutFirstPLam<PT>> :
        )
        : never;

/**
 * @requires - typescript@^4.1
 */
export type MethodsAsTerms<SMethods extends Methods> = {
    readonly [ Method in keyof SMethods as `p${Method & string}` ]: TermToMethod<SMethods[Method]>
}

// type test_3 = MethodsAsTerms<{
//     foo: Term<PLam<PInt, PBool>>
// }>

/**
 * keeps only the methods that take the specified `InputFilter` as first input
 */
export type FilterMethodsByInput<Ms extends Methods, InputFilter extends PType> = {
    [ M in keyof Ms ]:
        Ms[M] extends Term<PLam<infer MethodIn, PType>> ?
        (
            InputFilter extends PAlias<infer PAliased extends PType, infer _> ?
            (
                MethodIn extends PAliased ? Ms[M] :
                MethodIn extends PAlias<PAliased, infer _> ? Ms[M] :
                never
            ):
            (
                InputFilter extends PStruct<infer SDef extends StructDefinition, infer _> ?
                (
                    MethodIn extends PStruct<SDef, infer _> ? Ms[M] :
                    never
                ) : 
                (
                    MethodIn extends PAlias<infer PAliased extends PType, infer _> ?
                    (
                        InputFilter extends PAliased ? Ms[M] :
                        InputFilter extends PAlias<PAliased, infer _> ? Ms[M] :
                        never
                    ):
                    (
                        MethodIn extends PStruct<infer SDef extends StructDefinition, infer _> ?
                        (
                            InputFilter extends PStruct<SDef, infer _> ? Ms[M] :
                            never
                        ) :
                        // base case
                        ( MethodIn extends InputFilter ? Ms[M] : never )
                    )
                )
            )
        ) : never
} & Methods;

type test_4 = FilterMethodsByInput<{
    foo: Term<PLam<PInt, PBool>>
}, PInt>
type test_5 = FilterMethodsByInput<{
    foo: Term<PLam<PInt, PBool>>
}, PBool>
type test_6 = FilterMethodsByInput<{
    foo: Term<PLam<PAlias<PInt, {}>, PBool>>
}, PInt>
type test_7 = FilterMethodsByInput<{
    foo: Term<PLam<PAlias<PInt, {}>, PBool>>
}, PAlias<PInt, any>>
type test_8 = FilterMethodsByInput<{
    foo: Term<PLam<PAlias<PInt, {}>, PBool>>
    baz: Term<PLam<PInt, PBool>>
    moo: Term<PLam<PBool, PBool>>
}, PAlias<PInt, any>>

/**
 * keeps only the methods that are a `PLam` AND take AT LEAST 2 INPUTS
 */
export type FilterOutSingleInputMethods<Ms extends Methods> = {
    [ M in keyof Ms ]:
        Ms[M] extends Term<PLam<PType, PLam<PType,PType>>> ?
        Ms[M] : never
} & Methods;

type test_9 = FilterOutSingleInputMethods<{
    foo: Term<PLam<PInt, PBool>>,
    bar: Term<PFn<[ PInt, PInt ], PBool>>
}>