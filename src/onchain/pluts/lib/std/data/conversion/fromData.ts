import ObjectUtils from "../../../../../../utils/ObjectUtils";
import { PData } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { TermType } from "../../../../type_system";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { UtilityTermOf, addUtilityForType } from "../../../addUtilityForType";
import { papp } from "../../../papp";
import { _fromData, _pfromData } from "./fromData_minimal";

export function fromData<T extends TermType>( t: T ): ( term: Term<PData> ) => UtilityTermOf<ToPType<T>>
{
    // "as any" because
    // Type '(term: Term<PData>) => UtilityTermOf<PType | PStruct<StructDefinition> | ToPType<FromPType<ToPType<T>>>>'
    // is not assignable to type '(term: Term<PData>) => UtilityTermOf<ToPType<T>>'
    return (( term: Term<PData> ) => {
        const theTerm = _fromData( t )( term );
        return addUtilityForType( theTerm.type )( theTerm )
    }) as any
}

export function pfromData<T extends TermType>( t: T ): TermFn<[ PData ], ToPType<T>>
{
    const term = _pfromData( t );
    
    return ObjectUtils.definePropertyIfNotPresent(
        term, "$",
        {
            get: () => ( other: Term<PData> ) => papp( term, other ),
            set: () => {},
            configurable: false,
            enumerable: true
        }
    ) as any;
}