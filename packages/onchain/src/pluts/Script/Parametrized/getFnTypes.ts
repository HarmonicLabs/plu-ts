import { PrimType, TermType } from "../../type_system";

export function getFnTypes( fnT: TermType ): TermType[]
{
    const result: TermType[] = [];
    
    while( fnT[0] === PrimType.Lambda )
    {
        result.push( fnT[1] ),
        fnT = fnT[2];
    }

    result.push( fnT );

    return result;
}