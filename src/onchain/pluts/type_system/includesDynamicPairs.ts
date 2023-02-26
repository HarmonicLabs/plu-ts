import { unwrapAlias } from "./tyArgs";
import { GenericTermType, PrimType, StructDefinition } from "./types";


export function includesDynamicPairs( t: GenericTermType | StructDefinition ): boolean
{
    if( !Array.isArray( t ) ) return false;
    if( t[0] === PrimType.Alias ) return includesDynamicPairs( unwrapAlias( t as any ) );
    if( t[0] === PrimType.AsData ) return false;
    if( t[0] === PrimType.List ) return includesDynamicPairs( t[1] );
    if( t[0] === PrimType.Delayed ) return includesDynamicPairs( t[1] );
    if( t[0] === PrimType.Lambda )
    {
        return (
            includesDynamicPairs( t[1] ) ||
            includesDynamicPairs( t[2] )
        )
    }
    if( t[0] === PrimType.Pair )
    {
        return (
            t[1][0] === PrimType.AsData ||
            t[2][0] === PrimType.AsData
        )
    }

    return false;
}