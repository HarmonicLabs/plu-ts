import { TermFn, PLam, PList, PDelayed } from "../../../../PTypes";
import { TermType, ToPType, lam, list, fn, delayed } from "../../../../type_system";
import { papp } from "../../../papp";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { plet } from "../../../plet";
import { _old_plet } from "../../../plet/old";
import { precursive } from "../../../precursive";
import { _papp } from "../../data/conversion/minimal_common";
import { pmatchList } from "../pmatchList";


export function precursiveList<ReturnT  extends TermType, ElemtsT extends TermType>( returnT: ReturnT, elemsT: ElemtsT )
: TermFn<
    [
        PLam< // caseNil
            PLam<PList<ToPType<ElemtsT>>, ToPType<ReturnT>>, // self
            ToPType<ReturnT> // result for nil
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
    const finalType = lam( list( elemsT ), returnT );

    return phoist(
        precursive(
            pfn([
                    fn([
                        lam( finalType, returnT ),
                        fn([ finalType, elemsT, list( elemsT ) ], returnT ),
                        list( elemsT )
                    ],  returnT ),
                    lam( finalType, returnT ),
                    fn([ finalType, elemsT, list( elemsT ) ], returnT ),
                    list( elemsT )
                ], 
                returnT
            )
            ( ( self, matchNil, matchCons, lst ) =>
                _papp(
                    _old_plet(
                        papp(
                            papp(
                                self,
                                matchNil
                            ),
                            matchCons
                        )
                    ).in( finalSelf =>
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
                        )
                    ) as any,
                    lst
                )
            )
        )
    ) as any;
}
