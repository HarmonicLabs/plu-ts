import { PStruct, pstruct } from "../../PTypes/PStruct/pstruct";
import type { ConstantableStructType, ConstantableTermType } from "../../Term/Type/base";

import { FromPTypeConstantable } from "../../Term/Type/ts-pluts-conversion";
import { PDataRepresentable } from "../../PType/PDataRepresentable";

export type PMaybeT<PTy extends PDataRepresentable> = PStruct<{
    Just: { val: FromPTypeConstantable<PTy> },
    Nothing: {}
}> & ConstantableStructType

export function PMaybe<T extends ConstantableTermType>(tyArg: T)
{
    return pstruct({
        Just: { val: tyArg },
        Nothing: {}
    });
}