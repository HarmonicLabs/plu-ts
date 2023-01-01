import BasePlutsError from "../../../errors/BasePlutsError";
import ObjectUtils from "../../../utils/ObjectUtils";
import PType from "../PType";
import Term from "../Term";
import { TermType } from "../Term/Type/base";
import { isWellFormedType } from "../Term/Type/kinds";
import { ToPType } from "../Term/Type/ts-pluts-conversion";
import addUtilityForType, { UtilityTermOf } from "../stdlib/UtilityTerms/addUtilityForType";


export default function punsafeConvertType<FromPInstance extends PType, SomeExtension extends {}, ToTermType extends TermType>
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
        
        ObjectUtils.defineReadOnlyProperty(
            converted,
            k,
            (someTerm as any)[ k ]
        )

    });

    return addUtilityForType( toType )( converted ) as any;
}