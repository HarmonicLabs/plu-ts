import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { PList, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, fn, list } from "../../../../type_system";

export function _pprepend<ListElemT extends TermType>( listElemType: ListElemT )
    : Term<PLam<PLam<ToPType<ListElemT>, PList<ToPType<ListElemT>>>, PList<ToPType<ListElemT>>>>
{
    const listElemT = listElemType ;

    return new Term(
        fn([ listElemT, list( listElemT ) ], list( listElemT ) ) as any,
        _dbn => IRNative.mkCons
    ) as any;
}