import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { TermFn, PList } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, fn, list } from "../../../../type_system";
import { addApplications } from "../addApplications";


export function pprepend<ListElemT extends TermType>( listElemType: ListElemT )
    : TermFn<[ ToPType<ListElemT> , PList<ToPType<ListElemT>> ], PList<ToPType<ListElemT>>>
{
    const listElemT = listElemType ;

    return addApplications<[ ToPType<ListElemT> , PList<ToPType<ListElemT>> ], PList<ToPType<ListElemT>>>(
        new Term(
            fn([ listElemT, list( listElemT ) ], list( listElemT ) ) as any,
            _dbn => IRNative.mkCons
        )
    );
}