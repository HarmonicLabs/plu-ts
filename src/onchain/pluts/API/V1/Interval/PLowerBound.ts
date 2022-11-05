import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pgenericStruct, PStruct } from "../../../PTypes/PStruct/pstruct";
import { bool, ConstantableStructType, ConstantableTermType, PrimType } from "../../../Term/Type/base";
import PExtended, { PExtendedT } from "./PExtended";

export type PLowerBoundT<T extends ConstantableTermType> = PStruct<{
    PLowerBound: {
        bound: PExtendedT<T>,
        inclusive: [ PrimType.Bool ] 
    }
}> & ConstantableStructType

const _PLowerBound = pgenericStruct( a => {
    return {
        PLowerBound: {
            bound: PExtended( a ).type,
            inclusive: bool 
        }
    }
});

function PLowerBound<T extends ConstantableTermType>( tyArg: T ): PLowerBoundT<T>
{
    return _PLowerBound( tyArg ) as any;
}

export default ObjectUtils.defineReadOnlyProperty(
    PLowerBound,
    "type",
    _PLowerBound.type
);;