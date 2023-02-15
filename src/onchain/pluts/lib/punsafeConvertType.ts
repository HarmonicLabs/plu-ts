import { BasePlutsError } from "../../../errors/BasePlutsError";
import { PType } from "../PType";
import { Term } from "../Term";
import { UtilityTermOf, addUtilityForType } from "./addUtilityForType";
import { isWellFormedType } from "../type_system/kinds/isWellFormedType";
import { ToPType } from "../type_system/ts-pluts-conversion";
import { TermType } from "../type_system/types";


export function punsafeConvertType<FromPInstance extends PType, ToTermType extends TermType>
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

    return addUtilityForType( toType )( converted ) as any;
}