import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { TermFn, PBool, PLam, PDelayed } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, tyVar, fn, bool, delayed, lam } from "../../../../type_system";
import { UtilityTermOf } from "../../std/UtilityTerms/addUtilityForType";
import { papp } from "../../papp";
import { PappArg, pappArgToTerm } from "../../pappArg";
import { pdelay } from "../../pdelay";
import { pforce } from "../../pforce";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { TermBool, addPBoolMethods } from "../../std/UtilityTerms/TermBool";
import { pBool } from "../../std/bool/pBool";
import { addApplications } from "../addApplications";



export function pstrictIf<ReturnT extends TermType>( returnType: ReturnT ): TermFn<[ PBool, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    const returnT = returnType;

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
            _dbn => IRNative.strictIfThenElse
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
        _dbn => IRNative.strictIfThenElse
    );

    return defineReadOnlyProperty(
        _lambdaIf,
        "$",
        ( condition: Term< PBool> ): TermFn<[ ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>> => (() => {
            
            /*
            [ (builtin ifThenElse) condition ]
            */
            const _lambdaIfThen = papp( _lambdaIf, condition );

            const _lambdaIfThenApp = defineReadOnlyProperty(
                _lambdaIfThen,
                "$",
                //@ts-ignore
                ( caseTrue: PappArg<ToPType<ReturnT>> ): TermFn<[ ToPType<ReturnT> ],ToPType<ReturnT>> => (() => {
                    /*
                    [
                        [ (builtin ifThenElse) condition ]
                        (delay case true)
                    ]
                    */
                    const _lambdaIfThenElse = papp( _lambdaIfThen, pdelay( pappArgToTerm( caseTrue, returnT ) ) as any );

                    const _lambdaIfThenElseApp = defineReadOnlyProperty(
                        _lambdaIfThenElse,
                        "$",
                        ( caseFalse: PappArg<ToPType<ReturnT>> ): Term< ToPType<ReturnT>> =>
                            /*
                            (force [
                                [
                                    [ (builtin ifThenElse) condition ]
                                    (delay caseTrue)
                                ]
                                (delay caseFalse)
                            ])
                            */
                            pforce( papp( _lambdaIfThenElse, pdelay( pappArgToTerm( caseFalse, returnT ) ) as any ) as any ) as any
                    );
                    
                    // @ts-ingore Type instantiation is excessively deep and possibly infinite.
                    return defineReadOnlyProperty(
                        _lambdaIfThenElseApp,
                        "else",
                        _lambdaIfThenElseApp.$
                    );
                })() 
            );

            return defineReadOnlyProperty(
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
            pstrictIf( bool ).$( b )
            .$( pBool( false ) )
            .$( pBool( true  ) )
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
        plam(
            bool, lam( bool, bool )
        )( a => plam( bool, bool )
            ( b => pstrictIf( bool ).$( a )
                .$( b )
                .$( pBool( false ) )
        ))
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
        plam(
            bool, lam( delayed( bool ), bool )
        )( a => plam( delayed( bool ), bool )
            ( b =>
                pforce(
                    pstrictIf( delayed( bool ) ).$( a )
                    .$( b )
                    .$( pdelay( pBool( false ) ) )
                ),
            "pand"
        ), "pand")
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
        plam(
            bool, lam( bool, bool )
        )( a => plam( bool, bool )
            ( b => pstrictIf( bool ).$( a )
                .$( pBool( true ) )
                .$( b )
        ))
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
        plam(
            bool, lam( delayed( bool ), bool )
        )( a => plam( delayed( bool ), bool )
            ( b =>
                pforce(
                    pstrictIf( delayed( bool ) ).$( a )
                    .$( pdelay( pBool( true ) ) )
                    .$( b )
                ) 
        ))
    ) as any;

export const peqBool: Term<PLam<PBool, PLam<PBool, PBool>>>
& {
    $: ( bool: PappArg<PBool> ) =>
        Term<PLam<PBool, PBool>>
        & {
            $: ( bool: PappArg<PBool> ) => TermBool
        }
}
= phoist(
    plam(
        bool, lam( bool, bool )
    )( a => plam( bool, bool )
        ( b => pstrictIf( bool ).$( a )
            .$( b )
            .$( pnot.$( b ) )
    ))
) as any;