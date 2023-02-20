import ObjectUtils from "../../../../../../utils/ObjectUtils";
import { PAsData } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { TermType } from "../../../../type_system";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { UtilityTermOf, addUtilityForType } from "../../../addUtilityForType";
import { papp } from "../../../papp";
import { _ptoData, _toData } from "./toData_minimal";


export function toData<T extends TermType>( t: T ): ( term: Term<ToPType<T>> ) => UtilityTermOf<PAsData<ToPType<T>>>
{
    return ( term: Term<ToPType<T>> ) => {
        const theTerm = _toData( t )( term );
        return addUtilityForType( theTerm.type )( theTerm ) as any
    }
}


export function ptoData<T extends TermType>( t: T ): TermFn<[ ToPType<T> ], PAsData<ToPType<T>>>
{
    const term = _ptoData( t );
    
    return ObjectUtils.definePropertyIfNotPresent(
        term, "$",
        {
            get: () => ( other: Term<ToPType<T>> ) => papp( term, other ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    );
}