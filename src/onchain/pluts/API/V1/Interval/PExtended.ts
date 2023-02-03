import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pstruct, typeofGenericStruct } from "../../../PTypes/PStruct/pstruct";
import { ConstantableTermType } from "../../../Term/Type/base";

function _PExtended<T extends ConstantableTermType>( a: T )
{
    return pstruct({
        PNegInf: {},
        PFinite: { _0: a },
        PPosInf: {}
    });
};

export const PExtended =  ObjectUtils.defineReadOnlyProperty(
    _PExtended,
    "type",
    typeofGenericStruct( _PExtended as any )
);