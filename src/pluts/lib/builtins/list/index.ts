import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { PType } from "../../../PType";
import { TermFn, PList, PLam, PBool } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, tyVar, fn, list, delayed, lam, bool } from "../../../../type_system";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { pdelay } from "../../pdelay";
import { pforce } from "../../pforce";
import { addApplications } from "../addApplications";


export function pstrictChooseList<ListElemT extends TermType, ReturnT extends TermType>( listElemType: ListElemT, returnType: ReturnT )
    : TermFn<[ PList< ToPType<ListElemT>> , ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    const listElemT = listElemType ?? tyVar("pstrictChooseList_listElemType");
    const returnT = returnType ?? tyVar("pstrictChooseList_returnType");

    return addApplications<[ PList< ToPType<ListElemT>> , ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term(
            fn([ list( listElemT ), returnT, returnT ], returnT ) as any,
            _dbn => IRNative.strictChooseList
        )
    );
}


export function pchooseList<ListElemT extends TermType, ReturnT extends TermType>(
        listElemType: ListElemT | undefined = undefined ,
        returnType: ReturnT | undefined = undefined
    )
    : Term<PLam< PList< ToPType<ListElemT>> , PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, ToPType<ReturnT>>>>>
    & {
        $: ( list: PappArg<PList< ToPType<ListElemT>>>) =>
            Term<PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, ToPType<ReturnT>>>>
            & {
                caseNil: ( nilCase: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT>>
                    & {
                        caseCons: ( consCase: PappArg<ToPType<ReturnT>> ) =>
                        Term<ToPType<ReturnT>> 
                    },
                $: ( nilCase: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT>> & {
                        caseCons: ( consCase: PappArg<ToPType<ReturnT>> ) =>
                        Term<ToPType<ReturnT>> 
                    }
            }
    }
{
    const listElemT = listElemType ?? tyVar("pchooseList_listElemType");
    const returnT   = returnType   ?? tyVar("pchooseList_returnType");

    // new term identical to the strict one in order to define new (different) "$" properties
    const _chooseList = new Term<
        PLam<
            PList<ToPType<ListElemT>>,
            PLam<
                ToPType<ReturnT>,
                PLam<
                    ToPType<ReturnT>,
                    ToPType<ReturnT>
               >
           >
       >
   >(
        fn([list( listElemT ), delayed( returnT ), delayed( returnT )], returnT ) as any,
        _dbn => IRNative.strictChooseList
    );

    return defineReadOnlyProperty(
        _chooseList,
        "$",
        ( list: Term<PList<ToPType<ListElemT>>> ) => {

            const _chooseListNil = papp( _chooseList, list );

            const _chooseListNilApp = defineReadOnlyProperty(
                _chooseListNil,
                "$",
                ( nilCase: Term<ToPType<ReturnT>> ) => {

                    const _chooseListNilCons = papp( _chooseListNil, pdelay( nilCase ) as any );

                    const _chooseListNilConsApp = defineReadOnlyProperty(
                        _chooseListNilCons,
                        "$",
                        ( consCase: Term<ToPType<ReturnT>> ) => {

                            return pforce(
                                papp(
                                    _chooseListNilCons,
                                    pdelay( consCase ) as any
                                ) as any
                            );
                        }
                    );

                    return defineReadOnlyProperty(
                        _chooseListNilConsApp,
                        "caseCons",
                        _chooseListNilConsApp.$
                    )
                }
            );

            return defineReadOnlyProperty(
                _chooseListNilApp,
                "caseNil",
                _chooseListNilApp.$
            );
        }
    ) as any;
}

export function phead<ListElemT extends TermType>( listElemType: ListElemT )
    : TermFn<[ PList<ToPType<ListElemT>> ], ToPType<ListElemT>>
{
    const listElemT = listElemType;

    return addApplications<[ PList< ToPType<ListElemT>> ], ToPType<ListElemT>>(
        new Term(
            lam( list( listElemT ), listElemT ) as any,
            _dbn => IRNative.headList
        )
    );
}

export function ptail<ListElemT extends TermType>( listElemT: ListElemT )
    : TermFn<[ PList< ToPType<ListElemT>> ], PList< ToPType<ListElemT>>>
{
    return addApplications<[ PList< ToPType<ListElemT>> ], PList< ToPType<ListElemT>>>(
        new Term(
            lam( list( listElemT ), list( listElemT ) ) as any,
            _dbn => IRNative.tailList
        )
    );
}

export const pisEmpty: TermFn<[PList<PType>], PBool> = addApplications<[ PList<PType> ], PBool>(
        new Term(
            lam( list( tyVar() ), bool ) as any,
            _dbn => IRNative.nullList
        )
    );
