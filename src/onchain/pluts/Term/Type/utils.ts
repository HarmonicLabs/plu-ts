import { TermType, PrimType, DataConstructor, structType, anyStruct } from ".";
import JsRuntime from "../../../../utils/JsRuntime";
import { StructCtorDef, StructDefinition } from "../../PTypes/PStruct";

export function getNRequiredLambdaArgs( type: TermType ): number
{
    if( type[0] !== PrimType.Lambda ) return 0;

    return 1 + getNRequiredLambdaArgs( type[2] )
}

/**
 * @deprecated use ```getNRequiredLambdaArgs```
 */
export const getNRequiredArgs = getNRequiredLambdaArgs;

function ctorDefToString( ctorDef: StructCtorDef ): string
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

function structDefToString( def: StructDefinition ): string
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

export function termTypeToString( t: TermType ): string
{
    if( t[0] === structType )
    {
        return "struct(" + (
            t[1] === anyStruct ? "anyStruct" : structDefToString( t[1] as StructDefinition )
        ) + ")";
    }
    if( typeof t[0] === "symbol" ) return "tyParam("+ t[0].description +")";
    const tyArgs = t.slice(1) as TermType[];
    return ( t[0] + (tyArgs.length > 0 ? ',': "") + tyArgs.map( termTypeToString ).toString() );
}

export function cloneTermType( t: TermType ): TermType
{
    // covers
    // - simple types
    // - simple data types
    // - parameters
    if( t.length === 1 ) return [ ...t ];

    if( t[0] === PrimType.List ) return [ PrimType.List, cloneTermType( t[1] ) ];
    if( t[0] === PrimType.Delayed ) return [ PrimType.Delayed, cloneTermType( t[1] ) ];
    if( t[0] === PrimType.Pair ) return [ PrimType.Pair, cloneTermType( t[1] ), cloneTermType( t[2] ) ];
    if( t[0] === PrimType.Lambda ) return [ PrimType.Lambda, cloneTermType( t[1] ), cloneTermType( t[2] ) ];
    if( t[0] === DataConstructor.List ) return [ DataConstructor.List, cloneTermType( t[1] ) ];
    if( t[0] === DataConstructor.Pair ) return [ DataConstructor.Pair, cloneTermType( t[1] ), cloneTermType( t[2] ) ];
    
    throw JsRuntime.makeNotSupposedToHappenError(
        "'cloneTermType' did not match any 'TermType'"
    );
}