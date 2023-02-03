import { pstruct, typeofGenericStruct } from "../../PTypes/PStruct/pstruct";
import type { ConstantableTermType } from "../../Term/Type/base";

import ObjectUtils from "../../../../utils/ObjectUtils";

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