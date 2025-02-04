import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../../PType";
import { TermFn, PData, PLam, PInt, PList, PPair, PByteString, PBool, PAsData } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, fn, data, delayed, int, list, lam, pair, asData, bs, bool, _pair } from "../../../../type_system";
import { UtilityTermOf } from "../../std/UtilityTerms/addUtilityForType";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { pdelay } from "../../pdelay";
import { pforce_minimal } from "../../pforce/minimal";
import { TermBS } from "../../std/UtilityTerms/TermBS";
import { addApplications } from "../addApplications";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { IRHoisted } from "../../../../IR/IRNodes/IRHoisted";
import { IRApp } from "../../../../IR/IRNodes/IRApp";
import { IRConst } from "../../../../IR/IRNodes/IRConst";



/**
 * in theory 'chooseData' has 5 type parameters (1 per data constructor)
 * and this means any of those types can be returned
 * 
 * plu-ts wont support that in favor of type determinism
 */
export function pstrictChooseData<ReturnT extends TermType>( returnT: ReturnT )
    : TermFn<[ PData, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    return addApplications<[ PData, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term(
            fn(
                [ data, returnT, returnT, returnT, returnT, returnT ], returnT
            ) as any,
            _dbn => IRNative.chooseData
        )
    );
}

// only for pchooseData Type definition
// without this it would be impossoble to read
type CaseBFn<RetT extends PType> = ( bCase: PappArg< RetT> ) => UtilityTermOf<RetT>
export type CaseIFn<RetT extends PType> = ( iCase: PappArg< RetT> ) =>
    Term<PLam<RetT , RetT>>
    & {
        caseB: CaseBFn<RetT>
        $: CaseBFn<RetT>
    };
export type CaseListFn<RetT extends PType> = ( listCase: PappArg<RetT> ) =>
    Term<PLam<RetT, PLam<RetT , RetT>>>
    & {
        caseI: CaseIFn<RetT>,
        $: CaseIFn<RetT>
    }
export type CaseMapFn<RetT extends PType> = ( mapCase: PappArg< RetT> ) => 
    Term<PLam<RetT, PLam<RetT, PLam<RetT , RetT>>>>
    & {
        caseList: CaseListFn<RetT>,
        $: CaseListFn<RetT>
    }
export type CaseConstrFn<RetT extends PType> = ( constrCase: PappArg< RetT> ) =>
    Term<PLam<RetT, PLam<RetT, PLam<RetT, PLam<RetT , RetT>>>>>
    & {
        caseMap: CaseMapFn<RetT>,
        $: CaseMapFn<RetT>
    }

/*
@todo implement a recursive utility function to

automatically add delays to all alrguments except the first;
add aliases for the applications except the first;
force the last application (once provided argument and delayed)
*/
export function pchooseData<ReturnT extends TermType>( returnT: ReturnT )
    : Term< PLam< PData, PLam< ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT> , ToPType<ReturnT>>>>>>>>
    & {
        $: ( pdata: PappArg<PData> ) =>
            Term<PLam< ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT> , ToPType<ReturnT>>>>>>>
            & {
                caseConstr: CaseConstrFn<ToPType<ReturnT>>,
                $: CaseConstrFn<ToPType<ReturnT>>
            }
    }
{
    // new term identical to the strict one in order to define new (different) "$" properties
    const _chooseData  = new Term<
        PLam<
            PData,
            PLam<
                ToPType<ReturnT>,
                PLam<
                    ToPType<ReturnT>,
                    PLam<
                        ToPType<ReturnT>,
                        PLam<
                            ToPType<ReturnT>,
                            PLam<
                                ToPType<ReturnT>,
                                ToPType<ReturnT>
                           >
                       >
                   >
               >
           >
       >
   >(
        fn(
            [ data, delayed( returnT ), delayed( returnT ), delayed( returnT ), delayed( returnT ), delayed( returnT ) ], delayed( returnT )
        ) as any,
        _dbn => IRNative.chooseData
    );

    return defineReadOnlyProperty(
        _chooseData,
        "$",
        ( data: Term<PData> ): Term<PLam< ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT> , ToPType<ReturnT>>>>>>>
            & {
                caseConstr: CaseConstrFn<ToPType<ReturnT>>,
                $: CaseConstrFn<ToPType<ReturnT>>
            } => {
            // @ts-ignore Type instantiation is excessively deep and possibly infinite.
            const _cDWithData = papp( _chooseData, data );

            const _cDWithDataApp = defineReadOnlyProperty(
                _cDWithData,
                "$",
                ( caseConstr: Term<ToPType<ReturnT>> ) => {
                    const _cDDWithConstr = papp( _cDWithData, pdelay(caseConstr) as any );

                    const _cDDWithConstrApp = defineReadOnlyProperty(
                        _cDDWithConstr,
                        "$",
                        ( mapCase: Term< ToPType<ReturnT>> ) => {
                            const _cDDCWithMap = papp( _cDDWithConstr, pdelay( mapCase ) as any );

                            const _cDDCWithMapApp = defineReadOnlyProperty(
                                _cDDCWithMap,
                                "$",
                                ( listCase: Term< ToPType<ReturnT>> ) => {
                                    const _cDDCMWithList = papp( _cDDCWithMap, pdelay( listCase ) as any );

                                    const _cDDCMWithListApp = defineReadOnlyProperty(
                                        _cDDCMWithList,
                                        "$",
                                        ( iCase: Term<ToPType<ReturnT>> ) => {
                                            const _cDDCMLWithInt = papp( _cDDCMWithList, pdelay( iCase ) as any );

                                            const _cDDCMLWithIntApp = defineReadOnlyProperty(
                                                _cDDCMLWithInt,
                                                "$",
                                                ( bCase: Term<ToPType<ReturnT>> ) : Term<ToPType<ReturnT>> => {
                                                    return pforce_minimal(
                                                        papp( _cDDCMLWithInt, pdelay( bCase ) as any )
                                                    ) as any;
                                                }
                                            );

                                            return defineReadOnlyProperty(
                                                _cDDCMLWithIntApp,
                                                "caseB",
                                                _cDDCMLWithIntApp.$
                                            );
                                        }
                                    )

                                    return defineReadOnlyProperty(
                                        _cDDCMWithListApp,
                                        "caseI",
                                        _cDDCMWithListApp.$
                                    );
                                }
                            )

                            return defineReadOnlyProperty(
                                _cDDCWithMapApp,
                                "caseList",
                                _cDDCWithMapApp.$
                            );

                        }
                    )

                    return defineReadOnlyProperty(
                        _cDDWithConstrApp,
                        "caseMap",
                        _cDDWithConstrApp.$
                    );
                }
            );

            return defineReadOnlyProperty(
                _cDWithDataApp,
                "caseConstr",
                _cDWithDataApp.$
            ) as any;
        }
    ) as any;
}

export const pConstrToData:
    TermFn<[ PInt, PList<PData> ], PData>
    = addApplications<[ PInt, PList<PData> ], PData>(
        new Term(
            fn([ int, list( data ) ], data ),
            _dbn => IRNative.constrData
        )
    );

type PMap<K extends PType, V extends PType> = PList<PPair<K,V>>

export const pMapToData: TermFn<[ PMap<PData, PData> ], PData>
    = addApplications<[ PList<PPair<PData, PData>> ], PData>(
        new Term(
            lam(
                list( pair( data, data ) ),
                data
            ) as any,
            _dbn => IRNative.mapData
        )
    );

export const pListToData: TermFn<[ PList<PData> ], PData>
    = addApplications<[ PList<PData> ], PData>(
        new Term(
            lam( list( data ), data ),
            _dbn => IRNative.listData
        )
    );

export const pIntToData: TermFn<[ PInt ], PAsData<PInt>> 
    = addApplications<[ PInt ], PAsData<PInt>>(
        new Term<PLam<PInt, PAsData<PInt>>>(
            lam( int, asData( int ) ),
            _dbn => IRNative.iData
        )
    );

export const pBSToData: TermFn<[ PByteString ], PAsData<PByteString>> 
    = addApplications<[ PByteString ], PAsData<PByteString>>(
        new Term<PLam<PByteString, PAsData<PByteString>>>(
            lam( bs, asData( bs ) ),
            _dbn => IRNative.bData
        )
    );

export const punConstrData
    : TermFn<[ PData ], PPair<PInt, PList<PData>>>
    = addApplications<[ PData ], PPair<PInt, PList<PData>>>(
        new Term(
            // MUST be `_pair` and NOT `pair` because elements aren't data
            lam( data, _pair( int, list( data ) ) ),
            _dbn => IRNative.unConstrData
        )
    );

export const punMapData: TermFn<[ PData, PData ], PList<PPair<PData, PData>>>
    = addApplications<[ PData, PData ], PList<PPair<PData, PData>>>(
        new Term(
            lam( data, list( pair( data, data ) ) ) as any,
            _dbn => IRNative.unMapData
        )
    );


export const punListData: TermFn<[ PData ], PList<PData>>
    = addApplications<[ PData ], PList<PData>>(
        new Term(
            lam( data, list( data ) ),
            _dbn => IRNative.unListData
        )
    );

export const punIData: TermFn<[ PData ], PInt>
    = addApplications<[ PData ], PInt>(
        new Term(
            lam( data, int ),
            _dbn => IRNative.unIData,
        )
        //, addPIntMethods
    );

export const punBData: Term<PLam<PData, PByteString>>
& {
    $: ( dataBS: PappArg<PData> ) => TermBS
} = (() => {
    const unBData = new Term<PLam<PData, PByteString>>(
        lam( data, bs ),
        _dbn => IRNative.unBData
    );

    return defineReadOnlyProperty(
        unBData,
        "$",
        ( dataBS: Term<PData> ): TermBS =>
            papp( unBData, dataBS )
    );
})()

export const peqData: TermFn<[ PData, PData ], PBool>
    = addApplications<[ PData, PData ], PBool>(
        new Term<PLam<PData, PLam< PData, PBool>>>(
            fn([ data, data ], bool ),
            _dbn => IRNative.equalsData
        )
    );


export const pnilData: Term<PList< PData>>
    = new Term(
        list( data ),
        _dbn => new IRHoisted(
            new IRApp( IRNative.mkNilData, IRConst.unit )
        ),
        // true // isConstant
    );

export const pnilPairData: Term<PList< PPair<PData, PData>>>
    = new Term(
        list( pair( data, data ) ),
        _dbn => new IRHoisted(
            new IRApp( IRNative.mkNilPairData, IRConst.unit )
        ),
        // true // isConstant
    );


// --------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------- [ VASIL (Plutus V2) ] ----------------------------------------------- //
// --------------------------------------------------------------------------------------------------------------------- //

export const pserialiseData: TermFn<[ PData ], PByteString>
    = addApplications<[ PData ], PByteString>(
        new Term(
            lam( data, bs ),
            _dbn => IRNative.serialiseData
        )
    );