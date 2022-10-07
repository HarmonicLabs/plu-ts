import { pgenericStruct, PStruct } from "../PTypes/PStruct";
import { DataReprTermType } from "../Term/Type";

export type PMaybeT<T extends DataReprTermType> = PStruct<{
    Just: { value: T },
    Nothing: {}
}>

const _PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
 })

function PMaybe<T extends DataReprTermType>( tyArg: T ): PMaybeT<T>
{
    return _PMaybe( tyArg ) as unknown as PMaybeT<T>;
}

export default PMaybe;