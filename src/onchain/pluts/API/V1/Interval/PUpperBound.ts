import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pgenericStruct, PStruct } from "../../../PTypes/PStruct/pstruct";
import { bool, ConstantableStructType, ConstantableTermType, PrimType } from "../../../Term/Type/base";
import PExtended, { PExtendedT } from "./PExtended";

export type PUpperBoundT<T extends ConstantableTermType> = PStruct<{
    PUpperBound: {
        bound: PExtendedT<T>,
        inclusive: [ PrimType.Bool ] 
    }
}> & ConstantableStructType

const _PUpperBound = pgenericStruct( a => {
    return {
        PUpperBound: {
            bound: PExtended( a ).type,
            inclusive: bool 
        }
    }
});

function PUpperBound<T extends ConstantableTermType>( tyArg: T ): PUpperBoundT<T>
{
    return _PUpperBound( tyArg ) as any;
}

export default ObjectUtils.defineReadOnlyProperty(
    PUpperBound,
    "type",
    _PUpperBound.type
);;;