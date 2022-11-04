import ObjectUtils from "../../../utils/ObjectUtils";
import PType from "../PType";
import Term from "../Term";
import { TermType, ToPType } from "../Term/Type";


export default function punsafeConvertType<FromPInstance extends PType, SomeExtension extends {}, ToTermType extends TermType>
( someTerm: Term<FromPInstance> & SomeExtension, toType: ToTermType ): Term<ToPType<ToTermType>> & SomeExtension
{
const converted = new Term(
    toType,
    someTerm.toUPLC
) as any;

Object.keys( someTerm ).forEach( k => {

    if( k === "_type" || k === "_toUPLC" ) return;
    
    ObjectUtils.defineReadOnlyProperty(
        converted,
        k,
        (someTerm as any)[ k ]
    )

});

return converted;
}