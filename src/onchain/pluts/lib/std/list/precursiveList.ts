import { TermFn, PLam, PList } from "../../../PTypes";
import { TermType, tyVar, lam, list, fn } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plet } from "../../plet";
import { precursive } from "../../precursive";
import { pmatchList } from "./pmatchList";


export function precursiveList<ReturnT  extends TermType, ElemtsT extends TermType>( returnT: ReturnT, elemsT: ElemtsT = tyVar("elemsT_precursiveList") as any )
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
                plet(
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
                            finalSelf
                        )
                    )
                    .$(
                        papp(
                            matchCons,
                            finalSelf
                        )
                    )
                    .$( lst )
                ) as any
            )
        )
    ) as any;
}
