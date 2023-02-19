import { PType } from "../../../../PType";
import { TermFn, PLam, PList, PDelayed } from "../../../../PTypes";
import { TermType, tyVar, ToPType, fn, list, delayed } from "../../../../type_system";
import { phead, pstrictChooseList, ptail } from "../../../builtins/list";
import { papp } from "../../../papp";
import { pdelay } from "../../../pdelay";
import { pfn } from "../../../pfn";
import { pforce } from "../../../pforce";
import { phoist } from "../../../phoist";
import { _papp } from "../../data/conversion/minimal_common";


export function pmatchList<ReturnT  extends TermType, PElemsT extends PType>( returnT: ReturnT, elemsT: TermType )
: TermFn<[ PDelayed<PElemsT>, PLam<PElemsT,PLam<PList<PElemsT>, ToPType<ReturnT>>>, PList<PElemsT> ], ToPType<ReturnT>>
{
return phoist(
    pfn([
            delayed( returnT ),
            fn([ elemsT, list( elemsT ) ], returnT ),
            list( elemsT )
        ], 
        returnT 
    )
    ( ( matchNil, matchCons, list ) =>
        pforce(
            pstrictChooseList( elemsT, delayed( returnT ) ).$( list )
            .$( matchNil ) // caseNil
            .$(
                pdelay(
                    _papp(
                        _papp(
                            matchCons,
                            _papp(
                                phead( elemsT ),
                                list
                            )
                        ),
                        _papp(
                            ptail( elemsT ),
                            list
                        )
                    )
                )
            )
        )
    )
) as any;
}