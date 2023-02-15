import { TermFn, PLam, PList, PDelayed } from "../../../PTypes";
import { TermType, tyVar, ToPType, lam, list, fn, delayed } from "../../../type_system";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plet } from "../../plet";
import { precursive } from "../../precursive";
import { pmatchList } from "./pmatchList";


export function precursiveList<ReturnT  extends TermType, ElemtsT extends TermType>( returnT: ReturnT, elemsT: ElemtsT )
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
    const finalType = lam( list( elemsT ), returnT );

    return phoist(
        precursive(
            pfn([
                    fn([
                        lam( finalType, delayed( returnT ) ),
                        fn([ finalType, elemsT, list( elemsT ) ], returnT ),
                        list( elemsT )
                    ],  returnT ),
                    lam( finalType, delayed( returnT ) ),
                    fn([ finalType, elemsT, list( elemsT ) ], returnT ),
                    list( elemsT )
                ], 
                returnT
            )
            ( ( self, matchNil, matchCons, lst ) => 
                plet(
                    papp(
                        papp(
                            self,
                            matchNil
                        ) as any,
                        matchCons
                    ) as any
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
                    .$( lst )
                ) as any
            ) as any
        )  as any
    ) as any;
}
