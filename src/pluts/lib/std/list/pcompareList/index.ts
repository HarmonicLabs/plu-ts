import { PBool } from "../../../../PTypes/PBool";
import { PFn, TermFn } from "../../../../PTypes/PFn/PFn";
import { PList } from "../../../../PTypes/PList";
import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { TermType, bool, fn, list } from "../../../../../type_system/types";
import { pchooseList } from "../../../builtins/list";
import { papp } from "../../../papp";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { precursive } from "../../../precursive";

export function pcompareList<
    FstElsT extends TermType,
    SndElsT extends TermType
>(
    fstListElems: FstElsT,
    sndListElems: SndElsT
): TermFn<[

    // matchFstNil
    PFn<[
        
        PList<ToPType<SndElsT>>,

    ],  PBool>,

    // matchSndNil
    PFn<[
        
        PList<ToPType<FstElsT>>,
        
    ],  PBool>,

    // matchCons
    PFn<[
        
        ToPType<FstElsT>,

        ToPType<SndElsT>,
        
    ],  PBool>,

],  
    // final self
    PFn<[
        PList<ToPType<FstElsT>>,
        PList<ToPType<SndElsT>>,
    ],  PBool>
>
{
    const finalSelfType = fn([
        list( fstListElems ), 
        list( sndListElems ) 
    ],  bool );

    const matchFstNil_t = fn([
        list( sndListElems )
    ],  bool );

    const matchSndNil_t = fn([
        list( fstListElems )
    ],  bool );

    const matchCons_t = fn([
        fstListElems, 
        sndListElems,
    ],  bool );

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
                ],  bool )
                ((self, fstList, sndList) =>

                    pchooseList( fstListElems, bool )
                    .$( fstList )
                    .caseNil(
                        papp(
                            matchFstNil,
                            sndList
                        )
                    )
                    .caseCons(
                        pchooseList( sndListElems, bool )
                        .$( sndList )
                        .caseNil(
                            papp(
                                matchSndNil,
                                fstList
                            )
                        )
                        .caseCons(
                            papp(
                                papp(
                                    matchCons,
                                    fstList.head
                                ),
                                sndList.head
                            ).and(
                                papp(
                                    papp(
                                        self,
                                        fstList.tail
                                    ),
                                    sndList.tail
                                )
                            )
                        )
                    )
                )
            ) as any,
            "pcompareList"
        )
    ) as any;
}