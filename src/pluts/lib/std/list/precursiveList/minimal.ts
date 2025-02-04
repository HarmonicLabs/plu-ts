import { PLam, PList, PDelayed, PFn } from "../../../../PTypes";
import { TermType, ToPType, lam, list, fn, delayed } from "../../../../../type_system";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { _papp } from "../../data/conversion/minimal_common";
import { _pmatchList } from "../pmatchList/minimal";
import { Term } from "../../../../Term";
import { _precursive } from "../../../precursive/minimal";


export function _precursiveList<ReturnT  extends TermType, ElemtsT extends TermType>( returnT: ReturnT, elemsT: ElemtsT )
: Term<PFn<
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
>>
{
    const finalType = lam( list( elemsT ), returnT );

    return phoist(
        _precursive(
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
            ( ( self, matchNil, matchCons, lst ) => {

                const finalSelfTerm = _papp(
                    _papp(
                        self,
                        matchNil
                    ),
                    matchCons
                );

                const exprTerm = pfn([ finalSelfTerm.type ], returnT )
                ( finalSelf =>
                    _papp(
                        _papp(
                            _papp(
                                _pmatchList( returnT, elemsT ),
                                _papp(
                                    matchNil,
                                    finalSelf as any
                                )
                            ),
                            _papp(
                                matchCons,
                                finalSelf as any
                            ) as any
                        ),
                        lst
                    ) as any
                ) as any

                return _papp( exprTerm, finalSelfTerm );
            }, "_precursiveList")
        )
    ) as any;
}
