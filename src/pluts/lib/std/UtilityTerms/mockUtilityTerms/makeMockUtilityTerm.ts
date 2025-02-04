import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { TermType } from "../../../../../type_system/types";
import { UtilityTermOf } from "../addUtilityForType";
import { makeMockTerm } from "./makeMockTerm";
import { mockUtilityForType } from "./mockUtilityForType";

export function makeMockUtilityTerm<T extends TermType>( t: T ): UtilityTermOf<ToPType<T>>
{
    return (mockUtilityForType( t )( makeMockTerm( t ) ));
}