import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pstruct, typeofGenericStruct } from "../../../PTypes/PStruct/pstruct";
import { bool, ConstantableTermType } from "../../../Term/Type/base";
import { PExtended } from "./PExtended";

function _PLowerBound<T extends ConstantableTermType>( a: T )
{
    return pstruct({
        PLowerBound: {
            bound: PExtended( a ).type,
            inclusive: bool 
        }
    });
};


export const PLowerBound = ObjectUtils.defineReadOnlyProperty(
    _PLowerBound,
    "type",
    typeofGenericStruct( _PLowerBound as any )
);;