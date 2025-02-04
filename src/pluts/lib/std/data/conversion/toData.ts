import { definePropertyIfNotPresent } from "@harmoniclabs/obj-utils";
import { PAsData } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { TermType } from "../../../../../type_system";
import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { UtilityTermOf, addUtilityForType } from "../../UtilityTerms/addUtilityForType";
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
    
    return definePropertyIfNotPresent(
        term, "$",
        {
            get: () => ( other: Term<ToPType<T>> ) => {
                const theTerm = papp( term, other );
                (theTerm as any).isConstant = (other as any).isConstant;
                return theTerm;
            },
            set: () => {},
            configurable: false,
            enumerable: true
        }
    ) as any;
}