import { GenericTermType } from "../types";

export function isTypeParam( t: GenericTermType ): t is [ symbol ]
{
    return ((
        Array.isArray( t ) &&
        t.length === 1 &&
        typeof t[0] === "symbol"
    ) || typeof t === "symbol");
}