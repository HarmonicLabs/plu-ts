import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pstruct, typeofGenericStruct } from "../../../PTypes/PStruct/pstruct";
import { bool, ConstantableTermType } from "../../../Term/Type/base";
import { PExtended } from "./PExtended";

function _PUpperBound<T extends ConstantableTermType>( a: T )
{
    return pstruct({
        PUpperBound: {
            bound: PExtended( a ).type,
            inclusive: bool 
        }
    });
};


export const PUpperBound = ObjectUtils.defineReadOnlyProperty(
    _PUpperBound,
    "type",
    typeofGenericStruct( _PUpperBound as any )
);;