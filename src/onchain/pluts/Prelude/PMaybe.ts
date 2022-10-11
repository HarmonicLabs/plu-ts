import { pgenericStruct, PStruct } from "../PTypes/PStruct";
import { ConstantableTermType } from "../Term/Type";

export type PMaybeT<T extends ConstantableTermType> = PStruct<{
    Just: { value: T },
    Nothing: {}
}>

const _PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
 })

function PMaybe<T extends ConstantableTermType>( tyArg: T ): PMaybeT<T>
{
    return _PMaybe( tyArg ) as unknown as PMaybeT<T>;
}

export default PMaybe;