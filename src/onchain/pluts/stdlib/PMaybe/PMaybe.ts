import type { PStruct } from "../../PTypes/PStruct/pstruct";
import type { ConstantableStructType, ConstantableTermType } from "../../Term/Type/base";
import type { FromPTypeConstantable, ToPType } from "../../Term/Type/ts-pluts-conversion";
import type PDataRepresentable from "../../PType/PDataRepresentable";

import ObjectUtils from "../../../../utils/ObjectUtils";
import { pgenericStruct } from "../../PTypes/PStruct/pstruct";

export type PMaybeT<PTy extends PDataRepresentable> = PStruct<{
    Just: { val: FromPTypeConstantable<PTy> },
    Nothing: {}
}> & ConstantableStructType

const _PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { val: tyArg },
        Nothing: {}
    }
 })

function PMaybe<T extends ConstantableTermType>( tyArg: T ): PMaybeT<ToPType<T>>
{
    return _PMaybe ( tyArg ) as unknown as PMaybeT<ToPType<T>>;
}

export default ObjectUtils.defineReadOnlyProperty(
    PMaybe,
    "type",
    _PMaybe.type
);