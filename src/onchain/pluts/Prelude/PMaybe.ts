import { ReturnT } from "../../../utils/ts/TyFn";
import { PDataRepresentable } from "../PType";
import { pgenericStruct, PStruct } from "../PTypes/PStruct";

export type PMaybeT<PDT extends PDataRepresentable> = PStruct<{
    Just: { value: PDT },
    Nothing: {}
}>

const _PMaybe = pgenericStruct( _tyArg => {
    return {
        Just: { value: _tyArg },
        Nothing: {}
    }
 })

function PMaybe<PDT extends PDataRepresentable>( tyArg: new () => PDT ): PMaybeT<PDT>
{
    return _PMaybe( tyArg ) as unknown as PMaybeT<ReturnT<typeof tyArg>>;
}

export default PMaybe;