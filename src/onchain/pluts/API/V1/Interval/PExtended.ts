import ObjectUtils from "../../../../../utils/ObjectUtils";
import { pgenericStruct, PStruct } from "../../../PTypes/PStruct/pstruct";
import { ConstantableStructType, ConstantableTermType } from "../../../Term/Type/base";
import { termTypeToString } from "../../../Term/Type/utils";

export type PExtendedT<T extends ConstantableTermType> = PStruct<{
    PNegInf: {},
    PFinite: { _0: T },
    PPosInf: {}
}> & ConstantableStructType

const _PExtended = pgenericStruct( a => {
    return {
        PNegInf: {},
        PFinite: { _0: a },
        PPosInf: {}
    }
});

function PExtended<T extends ConstantableTermType>( tyArg: T ): PExtendedT<T>
{
    return _PExtended( tyArg ) as any;
}

export default ObjectUtils.defineReadOnlyProperty(
    PExtended,
    "type",
    _PExtended.type
);