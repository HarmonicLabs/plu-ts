import { PDataRepresentable } from "../../../PType/PDataRepresentable";
import { PStruct, pstruct } from "../../../PTypes/PStruct/pstruct";
import { ConstantableStructType, ConstantableTermType } from "../../../Term";
import { FromPTypeConstantable } from "../../../Term/Type/ts-pluts-conversion";

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