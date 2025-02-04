import { PType } from "../../../../PType";
import { TermFn, PLam, PList, PDelayed } from "../../../../PTypes";
import { TermType, ToPType, fn, list, delayed, data } from "../../../../../type_system";
import { phead, pstrictChooseList, ptail } from "../../../builtins/list";
import { pdelay } from "../../../pdelay";
import { pfn } from "../../../pfn";
import { pforce } from "../../../pforce";
import { phoist } from "../../../phoist";
import { _punsafeConvertType } from "../../../punsafeConvertType/minimal";
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
    (( matchNil, matchCons, lst ) =>
        pforce(
            pstrictChooseList( elemsT, delayed( returnT ) )
            .$( lst )
            .$( matchNil ) // caseNil
            .$(
                pdelay(
                    _papp(
                        _papp(
                            matchCons,
                            _papp(
                                phead( elemsT ),
                                lst
                            )
                        ),
                        _papp(
                            ptail( elemsT ),
                            lst
                        )
                    )
                )
            )
        ),
        "pmatchList"
    )
) as any;
}