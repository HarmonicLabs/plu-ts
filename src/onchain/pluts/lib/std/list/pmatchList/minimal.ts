import { PType } from "../../../../PType";
import { TermFn, PLam, PList, PDelayed } from "../../../../PTypes";
import { TermType, ToPType, fn, list, delayed } from "../../../../type_system";
import { _phead, _pstrictChooseList, _ptail } from "../../../builtins/list/minimal";
import { pdelay } from "../../../pdelay";
import { pfn } from "../../../pfn";
import { _pforce } from "../../../pforce/minimal";
import { phoist } from "../../../phoist";
import { _papp } from "../../data/conversion/minimal_common";


export function _pmatchList<ReturnT  extends TermType, PElemsT extends PType>( returnT: ReturnT, elemsT: TermType )
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
        _pforce(
            _papp(
                _papp(
                    _papp(
                        _pstrictChooseList( elemsT, delayed( returnT ) ),
                        list
                    ),
                    matchNil
                ),
                pdelay(
                    _papp(
                        _papp(
                            matchCons,
                            _papp(
                                _phead( elemsT ),
                                list
                            )
                        ),
                        _papp(
                            _ptail( elemsT ),
                            list
                        )
                    )
                )
            )
        )
    )
) as any;
}