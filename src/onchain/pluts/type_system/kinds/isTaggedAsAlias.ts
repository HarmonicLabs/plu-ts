import { GenericTermType, PrimType } from "../types";

export function isTaggedAsAlias( t: GenericTermType ): boolean
{
    return (
        Array.isArray( t ) && t.length === 2 &&
        t[0] === PrimType.Alias
    );
}
