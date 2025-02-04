import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { TermFn, PList } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, fn, lam, list } from "../../../../type_system";

export function _pstrictChooseList<ListElemT extends TermType, ReturnT extends TermType>( listElemT: ListElemT, returnT: ReturnT )
    : TermFn<[ PList< ToPType<ListElemT>> , ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    return new Term(
            fn([ list( listElemT ), returnT, returnT ], returnT ) as any,
            _dbn => IRNative.strictChooseList
        ) as any;
}


export function _phead<ListElemT extends TermType>( listElemType: ListElemT )
    : TermFn<[ PList<ToPType<ListElemT>> ], ToPType<ListElemT>>
{
    const listElemT = listElemType;

    return new Term(
            lam( list( listElemT ), listElemT ) as any,
            _dbn => IRNative.headList
        ) as any;
}

export function _ptail<ListElemT extends TermType>( listElemT: ListElemT )
    : TermFn<[ PList< ToPType<ListElemT>> ], PList< ToPType<ListElemT>>>
{
    return new Term(
            lam( list( listElemT ), list( listElemT ) ) as any,
            _dbn => IRNative.tailList
        ) as any;
}