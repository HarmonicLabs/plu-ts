import type { PType } from "../../PType";
import type { TermType } from "../../type_system/types";
import type { ToPType } from "../../type_system/ts-pluts-conversion";
import { type UtilityTermOf, addUtilityForType } from "../addUtilityForType";
import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { isWellFormedType } from "../../type_system/kinds/isWellFormedType";
import { Term } from "../../Term";


export function _punsafeConvertType<FromPInstance extends PType, ToTermType extends TermType>
( someTerm: Term<FromPInstance>, toType: ToTermType ): UtilityTermOf<ToPType<ToTermType>>
{
    if( !isWellFormedType( toType ) )
    throw new BasePlutsError("");

    const converted = new Term(
        toType,
        someTerm.toUPLC,
        Boolean((someTerm as any).isConstant) // isConstant
    ) as any;

    Object.keys( someTerm ).forEach( k => {

        if( k === "_type" || k === "_toUPLC" ) return;
        
        Object.defineProperty(
            converted,
            k,
            Object.getOwnPropertyDescriptor(
                someTerm,
                k
            ) ?? {}
        )

    });

    return converted as any;
}