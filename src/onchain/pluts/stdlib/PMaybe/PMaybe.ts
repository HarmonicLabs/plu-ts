import { PStruct, pstruct, typeofGenericStruct } from "../../PTypes/PStruct/pstruct";
import type { ConstantableStructType, ConstantableTermType } from "../../Term/Type/base";

import ObjectUtils from "../../../../utils/ObjectUtils";
import { FromPTypeConstantable } from "../../Term/Type/ts-pluts-conversion";
import { PDataRepresentable } from "../../PType/PDataRepresentable";

export type PMaybeT<PTy extends PDataRepresentable> = PStruct<{
    Just: { val: FromPTypeConstantable<PTy> },
    Nothing: {}
}> & ConstantableStructType

function _PMaybe<T extends ConstantableTermType>(tyArg: T)
{
    return pstruct({
        Just: { val: tyArg },
        Nothing: {}
    });
}

export const PMaybe = ObjectUtils.defineReadOnlyProperty(
    _PMaybe,
    "type",
    typeofGenericStruct( _PMaybe as any )
);