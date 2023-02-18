import JsRuntime from "../../../utils/JsRuntime";
import { isTaggedAsAlias } from "./kinds/isTaggedAsAlias";
import { unwrapAlias } from "./tyArgs/unwrapAlias";
import { GenericTermType, PrimType, StructCtorDef, StructDefinition, TermType, cloneStructDef } from "./types";
import { isStructType } from "./kinds/isWellFormedType";

export function getNRequiredLambdaArgs( type: TermType ): number
{
    if( type[0] !== PrimType.Lambda ) return 0;

    return 1 + getNRequiredLambdaArgs( type[2] )
}
/**
 * @deprecated use ```getNRequiredLambdaArgs```
 */
export const getNRequiredArgs = getNRequiredLambdaArgs;

export function ctorDefToString( ctorDef: StructCtorDef ): string
{
    const fields = Object.keys( ctorDef );

    let str = "{";

    for( const fieldName of fields )
    {
        str += ' ' + fieldName + ": " + termTypeToString( ctorDef[ fieldName ] );
    }

    str += " }";

    return str;
}

export function structDefToString( def: StructDefinition ): string
{
    const ctors = Object.keys( def );

    let str = "{";

    for( const ctor of ctors )
    {
        str += ' ' + ctor + ": " + ctorDefToString( def[ctor] ) + " },"
    }

    str = str.slice( 0, str.length - 1 ) + " }";

    return  str
}

export function termTypeToString( t: GenericTermType ): string
{
    const tag = t[0];
    if( tag === PrimType.Struct )
    {
        return "struct(" + (
            structDefToString( t[1] as StructDefinition )
        ) + ")";
    }
    if( isTaggedAsAlias( t ) )
    {
        return "alias(" + (
            unwrapAlias( t as any )
        ) + ")";
    }
    if( tag === PrimType.AsData )
    {
        return "asData(" + (
            termTypeToString( t[1] as any )
        ) + ")";
    }
    if( tag === PrimType.List )
    {
        return "list(" + (
            termTypeToString( t[1] as any )
        ) + ")";
    }
    if( tag === PrimType.Pair )
    {
        return "pair(" + (
            termTypeToString( t[1] as any )
        ) + "," + (
            termTypeToString( t[2] as any )
        ) + ")";
    }

    if( typeof t[0] === "symbol" ) return "tyParam("+ ((t[0] as any).description ?? "") +")";
    const tyArgs = t.slice(1) as TermType[];
    return ( t[0] + (tyArgs.length > 0 ? ',': "") + tyArgs.map( termTypeToString ).toString() );
}


/*
export function cloneTermType<T extends TermType>( t: T ): T
{
    // covers
    // - simple types
    // - simple data types
    // - parameters
    if( t.length === 1 ) return [ ...t ];

    if( isStructType( t ) )
    {
        return [ t[0], typeof t[1] === "symbol" ? t[1] : cloneStructDef( t[1] ) ] as any;
    }

    if( t[0] === PrimType.List ) return [ PrimType.List, cloneTermType( t[1] ) ] as any;
    if( t[0] === PrimType.Delayed ) return [ PrimType.Delayed, cloneTermType( t[1] ) ] as any;
    if( t[0] === PrimType.Pair ) return [ PrimType.Pair, cloneTermType( t[1] ), cloneTermType( t[2] ) ] as any;
    if( t[0] === PrimType.Lambda ) return [ PrimType.Lambda, cloneTermType( t[1] ), cloneTermType( t[2] ) ] as any;
    
    throw JsRuntime.makeNotSupposedToHappenError(
        "'cloneTermType' did not match any 'TermType'"
    );
}
//*/
