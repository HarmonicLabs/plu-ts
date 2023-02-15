import { PDataRepresentable } from "../../../PType/PDataRepresentable";
import { PStruct, pstruct } from "../../../PTypes/PStruct/pstruct";
import { FromPType, TermType } from "../../../type_system";

export type PMaybeT<PTy extends PDataRepresentable> = PStruct<{
    Just: { val: FromPType<PTy> },
    Nothing: {}
}>

export function PMaybe<T extends TermType>(tyArg: T)
{
    return pstruct({
        Just: { val: tyArg },
        Nothing: {}
    });
}