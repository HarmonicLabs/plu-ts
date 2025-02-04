import { TermFn } from "../../../../PTypes/PFn";
import { PFn } from "../../../../PTypes/PFn/PFn";
import { PList } from "../../../../PTypes/PList";
import { ToPType } from "../../../../../type_system";
import { TermType, delayed, fn, lam, list } from "../../../../../type_system/types";
import { papp } from "../../../papp";
import { pdelay } from "../../../pdelay";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { precursive } from "../../../precursive";
import { pmatchList } from "../pmatchList";

export function piterLists<
    FstElsT extends TermType,
    SndElsT extends TermType,
    ResultT extends TermType
>(
    fstListElems: FstElsT,
    sndListElems: SndElsT,
    resultT: ResultT
): TermFn<[

    // matchFstNil
    PFn<[
        
        // final self
        PFn<[
            PList<ToPType<FstElsT>>,
            PList<ToPType<SndElsT>>,
        ],  ToPType<ResultT>>,

        PList<ToPType<SndElsT>>,

    ],  ToPType<ResultT>>,

    // matchSndNil
    PFn<[
        
        // final self
        PFn<[
            PList<ToPType<FstElsT>>,
            PList<ToPType<SndElsT>>,
        ],  ToPType<ResultT>>,

        PList<ToPType<FstElsT>>,
        
    ],  ToPType<ResultT>>,

    // matchCons
    PFn<[
        
        // final self
        PFn<[
            PList<ToPType<FstElsT>>,
            PList<ToPType<SndElsT>>,
        ],  ToPType<ResultT>>,

        ToPType<FstElsT>,
        PList<ToPType<FstElsT>>,

        ToPType<SndElsT>,
        PList<ToPType<SndElsT>>,
        
    ],  ToPType<ResultT>>,

],  
    // final self
    PFn<[
        PList<ToPType<FstElsT>>,
        PList<ToPType<SndElsT>>,
    ],  ToPType<ResultT>>
>
{
    const finalSelfType = fn([
        list( fstListElems ), 
        list( sndListElems ) 
    ],  resultT );

    const matchFstNil_t = fn([
        finalSelfType,
        list( sndListElems )
    ],  resultT );

    const matchSndNil_t = fn([
        finalSelfType,
        list( fstListElems )
    ],  resultT );

    const matchCons_t = fn([
        finalSelfType, 
        fstListElems, 
        list( fstListElems ),
        sndListElems,
        list( sndListElems ) 
    ],  resultT );

    return phoist(
        pfn([
            matchFstNil_t,
            matchSndNil_t,
            matchCons_t
        ],  finalSelfType)
        (( matchFstNil, matchSndNil, matchCons ) =>
            precursive(
                pfn([
                    finalSelfType,
                    list( fstListElems ), 
                    list( sndListElems ) 
                ],  resultT )
                ((self, fstList, sndList) => 
                    pmatchList( resultT, fstListElems )
                    .$( 
                        pdelay(
                            papp(
                                papp(
                                    matchFstNil,
                                    self
                                ),
                                sndList
                            )
                        )
                    )
                    .$(
                        pfn([
                            fstListElems,
                            list( fstListElems )
                        ],  resultT)
                        (( fstEl, restFst ) =>
                            pmatchList( resultT, sndListElems )
                            .$(
                                pdelay(
                                    papp(
                                        papp(
                                            matchSndNil,
                                            self
                                        ),
                                        fstList
                                    )
                                )
                            )
                            .$(
                                pfn([
                                    sndListElems,
                                    list( sndListElems )
                                ],  resultT)
                                (( sndEl, restSnd ) =>
                                    papp(
                                        papp(
                                            papp(
                                                papp(
                                                    papp(
                                                        matchCons,
                                                        self
                                                    ),
                                                    fstEl
                                                ),
                                                restFst
                                            ),
                                            sndEl
                                        ),
                                        restSnd
                                    )
                                )
                            )
                            .$( sndList ) as any
                        )
                    )
                    .$( fstList ) as any
                )
            ) as any,
            "piterLists"
        )
    ) as any;
}