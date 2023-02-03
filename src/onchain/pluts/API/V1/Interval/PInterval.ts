import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pstruct, typeofGenericStruct } from "../../../PTypes/PStruct/pstruct";
import { ConstantableTermType } from "../../../Term/Type/base";
import { PLowerBound } from "./PLowerBound";
import { PUpperBound } from "./PUpperBound";

function _PInterval<T extends ConstantableTermType>( a: T )
{
    return pstruct({
        PInterval: {
            from: PLowerBound( a ).type,
            to: PUpperBound( a ).type
        }
    })
};


export const PInterval = ObjectUtils.defineReadOnlyProperty(
    _PInterval,
    "type",
    typeofGenericStruct( _PInterval as any )
);