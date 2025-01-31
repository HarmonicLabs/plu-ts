import { GenericTermType, PrimType, TermType } from "../types";

export function isTaggedAsAlias( t: GenericTermType ): t is [ PrimType.Alias, TermType, {} ]
{
    return (
        Array.isArray( t ) && t.length >= 2 &&
        t[0] === PrimType.Alias
    );
}
