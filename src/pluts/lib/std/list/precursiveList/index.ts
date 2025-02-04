import { TermFn, PLam, PList, PDelayed } from "../../../../PTypes";
import { TermType, ToPType, lam, list, fn, delayed } from "../../../../../type_system";
import { papp } from "../../../papp";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { plet } from "../../../plet";
import { precursive } from "../../../precursive";
import { _papp } from "../../data/conversion/minimal_common";
import { pmatchList } from "../pmatchList";


export function precursiveList<
    ReturnT  extends TermType, 
    ElemtsT extends TermType
>( 
    returnT: ReturnT, 
    elemsT: ElemtsT 
)
: TermFn<
    [
        PLam< // caseNil
            PLam<PList<ToPType<ElemtsT>>, ToPType<ReturnT>>, // self
            PDelayed<ToPType<ReturnT>> // result for nil
        >,
        PLam< // caseCons
            PLam<PList<ToPType<ElemtsT>>, ToPType<ReturnT>>, // self
            PLam< ToPType<ElemtsT>, PLam<PList<ToPType<ElemtsT>>,ToPType<ReturnT>>> // x xs -> result for cons
        >,
        PList<ToPType<ElemtsT>> // list
    ],
    ToPType<ReturnT> // result
>
{
    const finalSelfType = lam( list( elemsT ), returnT );

    const matchNil_t = lam( finalSelfType, delayed( returnT ) );

    const matchCons_t = fn([ finalSelfType, elemsT, list( elemsT ) ], returnT );

    const originalSelf_t = fn([
        matchNil_t,
        matchCons_t,
        list( elemsT )
    ],  returnT);

    return phoist(
        precursive(
            pfn([
                originalSelf_t,
                matchNil_t,
                matchCons_t,
                list( elemsT )
            ],  returnT )
            (( self, matchNil, matchCons, lst ) => 
                plet(
                    papp(
                        papp(
                            self,
                            matchNil
                        ),
                        matchCons
                    )
                ).in( finalSelf =>
                    _papp(
                        pmatchList( returnT, elemsT )
                        .$(
                            papp(
                                matchNil,
                                finalSelf as any
                            )
                        )
                        .$(
                            papp(
                                matchCons,
                                finalSelf as any
                            ) as any
                        ),
                        lst
                    ) as any
                ) as any,
                "precursiveList"
            )
        )
    ) as any;
}
