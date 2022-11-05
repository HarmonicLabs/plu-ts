import ObjectUtils from "../../../../utils/ObjectUtils";
import { PDataRepresentable } from "../../PType";
import { pgenericStruct, PStruct } from "../../PTypes/PStruct/pstruct";
import { ConstantableStructType, ConstantableTermType, FromPType, FromPTypeConstantable, ToPType } from "../../Term/Type/base";

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