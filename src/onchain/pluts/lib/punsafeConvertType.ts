import ObjectUtils from "../../../utils/ObjectUtils";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { PType } from "../PType";
import { TermType, Term } from "../Term";
import { isWellFormedType } from "../Term/Type/kinds";
import { ToPType } from "../Term/Type/ts-pluts-conversion";
import { UtilityTermOf, addUtilityForType } from "./addUtilityForType";


export function punsafeConvertType<FromPInstance extends PType, SomeExtension extends {}, ToTermType extends TermType>
( someTerm: Term<FromPInstance> & SomeExtension, toType: ToTermType ): Term<ToPType<ToTermType>> & SomeExtension & UtilityTermOf<ToPType<ToTermType>>
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