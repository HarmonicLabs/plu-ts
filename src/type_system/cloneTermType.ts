import { cloneStructDef } from "../pluts/PTypes/PStruct/cloneStructDef";
import { GenericTermType, PrimType, lam, struct, pair, list, delayed, asData, alias, sop } from "./types";

export function cloneTermType<T extends GenericTermType>( t: T ): T
{
    if( t[ 0 ] === PrimType.Struct )
    return struct( cloneStructDef( t[1] ), t[2] ) as any;

    if( t[ 0 ] === PrimType.Sop )
    return sop( cloneStructDef( t[1] ), t[2] ) as any;

    if( t[ 0 ] === PrimType.Lambda )
    return lam( cloneTermType( t[1] ), cloneTermType( t[2] ) ) as any;

    if( t[ 0 ] === PrimType.Pair )
    return pair( cloneTermType( t[1] ), cloneTermType( t[2] ) ) as any;

    if( t[ 0 ] === PrimType.List )
    return list( cloneTermType( t[1] ) ) as any;

    if( t[ 0 ] === PrimType.Delayed )
    return delayed( cloneTermType( t[1] ) ) as any;

    if( t[ 0 ] === PrimType.AsData )
    return asData( cloneTermType( t[1] ) ) as any;

    if( t[ 0 ] === PrimType.Alias )
    return alias( cloneTermType( t[1] ), t[2] ) as any;

    return [ t[0] ] as any;
}