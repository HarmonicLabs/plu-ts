import { PrimType, TermType } from "../types";

export function unwrapAsData<T extends TermType>( t: [ PrimType.AsData, T  ] ): T
{
    return t[1] as any;
}