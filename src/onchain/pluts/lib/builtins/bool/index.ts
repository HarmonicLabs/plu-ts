import ObjectUtils from "../../../../../utils/ObjectUtils";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PBool, PLam, PDelayed } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, tyVar, fn, bool, delayed } from "../../../type_system";
import { UtilityTermOf } from "../../addUtilityForType";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { pdelay } from "../../pdelay";
import { pfn } from "../../pfn";
import { pforce } from "../../pforce";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { TermBool, addPBoolMethods, pBool } from "../../std";
import { addApplications } from "../addApplications";



export function pstrictIf<ReturnT extends TermType>( returnType: ReturnT | undefined = undefined ): TermFn<[ PBool, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    const returnT = returnType ?? tyVar("pstrictIf_returnType");

    return addApplications<[ PBool, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term<
            PLam<
                PBool,
                PLam<
                    ToPType<ReturnT>,
                    PLam<
                        ToPType<ReturnT>,
                        ToPType<ReturnT>
                   >
               >
           >
       >
        (
            fn([ bool, returnT, returnT ], returnT ) as any,
            _dbn => Builtin.ifThenElse
        ) as any
    ) as any;
}

export function pif<ReturnT extends TermType>( returnType: ReturnT | undefined = undefined )
    : Term<PLam<PBool, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, ToPType<ReturnT>>>>> 
    & {
        $: (condition: PappArg<PBool>) =>
            Term<PLam< ToPType<ReturnT>, PLam< ToPType<ReturnT>, ToPType<ReturnT>>>> 
            & {
                then: ( caseTrue: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT>>
                    & {
                        else: ( caseFalse: PappArg<ToPType<ReturnT>> ) =>
                        UtilityTermOf<ToPType<ReturnT>> 
                    },
                $: ( caseTrue: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT>> & {
                        else: ( caseFalse: PappArg<ToPType<ReturnT>> ) =>
                        UtilityTermOf<ToPType<ReturnT>> 
                    }
            }
    }
{

    const returnT = returnType ?? tyVar("pif_returnType");

    // new term identical to the strict one in order to define new (different) "$" properties
    const _lambdaIf = new Term<
        PLam<
            PBool,
            PLam<
                ToPType<ReturnT>,
                PLam<
                    ToPType<ReturnT>,
                    ToPType<ReturnT>
               >
           >
       >
   >(
        // type is different from the one specified by the generic because
        // ```papp``` throws if types don't match;
        // but the perceived type form the user perspective is the one of the generic
        fn([ bool, delayed( returnT ), delayed( returnT ) ], delayed( returnT ) ) as any,
        _dbn => Builtin.ifThenElse
    );

    return ObjectUtils.defineReadOnlyProperty(
        _lambdaIf,
        "$",
        ( condition: Term< PBool> ): TermFn<[ ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>> => (() => {
            
            /*
            [ (builtin ifThenElse) condition ]
            */
            const _lambdaIfThen = papp( _lambdaIf, condition );

            const _lambdaIfThenApp = ObjectUtils.defineReadOnlyProperty(
                _lambdaIfThen,
                "$",
                //@ts-ignore
                ( caseTrue: Term<ToPType<ReturnT>> ): TermFn<[ ToPType<ReturnT> ],ToPType<ReturnT>> => (() => {
                    /*
                    [
                        [ (builtin ifThenElse) condition ]
                        (delay case true)
                    ]
                    */
                    const _lambdaIfThenElse = papp( _lambdaIfThen, pdelay( caseTrue ) as any );

                    const _lambdaIfThenElseApp = ObjectUtils.defineReadOnlyProperty(
                        _lambdaIfThenElse,
                        "$",
                        ( caseFalse: Term<ToPType<ReturnT>> ): Term< ToPType<ReturnT>> =>
                            /*
                            (force [
                                [
                                    [ (builtin ifThenElse) condition ]
                                    (delay caseTrue)
                                ]
                                (delay caseFalse)
                            ])
                            */
                            pforce( papp( _lambdaIfThenElse, pdelay( caseFalse ) as any ) as any ) as any
                    );
                    
                    // @ts-ingore Type instantiation is excessively deep and possibly infinite.
                    return ObjectUtils.defineReadOnlyProperty(
                        _lambdaIfThenElseApp,
                        "else",
                        _lambdaIfThenElseApp.$
                    );
                })() 
            );

            return ObjectUtils.defineReadOnlyProperty(
                _lambdaIfThenApp,
                "then",
                _lambdaIfThenApp.$
            );
        })() as any
    ) as any;
}


export const pnot
    : Term<PLam<PBool, PBool>>
    & {
        $: ( bool: PappArg<PBool> ) => TermBool
    }
    =
    phoist(
        plam( bool, bool )
        ( b => 
            addPBoolMethods(
                pstrictIf( bool ).$( b )
                .$( pBool( false ) )
                .$( pBool( true  ) )
            )
        )
    ) as any;

export const pstrictAnd
    : Term<PLam<PBool, PLam<PBool, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PBool, PBool>>
            & {
                $: ( bool: PappArg<PBool> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, bool ], bool )
        (( a: Term<PBool>, b: Term<PBool> ) => {

            // it makes no sense to use `pif` as
            // what is delayed are variables (already evaluated)
            return addPBoolMethods(
                pstrictIf( bool ).$( a )
                .$( b )
                .$( pBool( false ) )
            );
        })
    ) as any;

export const pand
    : Term<PLam<PBool, PLam<PDelayed<PBool>, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PDelayed<PBool>, PBool>>
            & {
                $: ( bool: PappArg<PDelayed<PBool>> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, delayed( bool ) ], bool )
        (( a: Term<PBool>, b: Term<PDelayed<PBool>> ) => {

            return addPBoolMethods(
                pforce(
                    pstrictIf( delayed( bool ) ).$( a )
                    .$( b )
                    .$( pdelay( pBool( false ) ) )
                )
            );
        })
    ) as any;

export const pstrictOr
    : Term<PLam<PBool, PLam<PBool, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PBool, PBool>>
            & {
                $: ( bool: PappArg<PBool> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, bool ], bool )
        (( a: Term<PBool>, b: Term<PBool> ) => {

            // it makes no sense to use `pif` as
            // what is delayed are variables (already evaluated)
            return addPBoolMethods(
                pstrictIf( bool  ).$( a )
                .$( pBool( true ) )
                .$( b )
            );
        })
    ) as any;

export const por
    : Term<PLam<PBool, PLam<PDelayed<PBool>, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PDelayed<PBool>, PBool>>
            & {
                $: ( bool: PappArg<PDelayed<PBool>> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, delayed( bool ) ], bool )
        (( a: Term<PBool>, b: Term<PDelayed<PBool>> ) => {

            return addPBoolMethods(
                pforce(
                    pstrictIf( delayed( bool ) ).$( a )
                    .$( pdelay( pBool( true ) ) )
                    .$( b )
                )
            );
        })
    ) as any;

