import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PList } from "../../PTypes";
import { Type, Term } from "../../Term";
import { TermType } from "../../Term/Type"
import { ToPType } from "../../Term/Type/ts-pluts-conversion";
import { addApplications } from "./addApplications";


export function pprepend<ListElemT extends TermType>( listElemType: ListElemT | undefined = undefined )
    : TermFn<[ ToPType<ListElemT> , PList< ToPType<ListElemT> > ], PList< ToPType<ListElemT> > >
{
    const listElemT = listElemType ?? Type.Var("pprepend_listElemType");

    return addApplications<[ ToPType<ListElemT> , PList< ToPType<ListElemT> > ], PList< ToPType<ListElemT> > >(
        new Term(
            Type.Fn([ listElemT, Type.List( listElemT ) ], Type.List( listElemT ) ),
            _dbn => Builtin.mkCons
        )
    );
}