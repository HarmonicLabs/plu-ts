import { isObject } from "@harmoniclabs/obj-utils";
import { isTaggedAsAlias } from "./kinds/isTaggedAsAlias";
import { unwrapAlias } from "./tyArgs/unwrapAlias";
import { GenericTermType, PrimType, StructCtorDef, StructDefinition, TermType, alias, asData, delayed, lam, list, pair, struct, tyVar } from "./types";

export function getNRequiredLambdaArgs( type: GenericTermType ): number
{
    if( type[0] !== PrimType.Lambda ) return 0;

    return 1 + getNRequiredLambdaArgs( type[2] )
}
/**
 * @deprecated use ```getNRequiredLambdaArgs```
 */
export const getNRequiredArgs = getNRequiredLambdaArgs;

export function ctorDefToString( ctorDef: StructCtorDef, limit: number = Infinity ): string
{
    if( limit <= 0 ) return "{ ... }";

    const fields = Object.keys( ctorDef );

    if( fields.length === 0 ) return "{}";

    let str = "{";

    for( const fieldName of fields )
    {
        str += ' ' + fieldName + ": " + termTypeToString( ctorDef[ fieldName ], limit - 1 );
    }

    str += " }";

    return str;
}

export function structDefToString( def: StructDefinition, limit: number = Infinity ): string
{
    const ctors = Object.keys( def );

    let str = "{";

    for( const ctor of ctors )
    {
        str += ' ' + ctor + ": " + ctorDefToString( def[ctor], limit ) + " },"
    }

    str = str.slice( 0, str.length - 1 ) + " }";

    return  str
}

export function termTypeToString( t: GenericTermType, limit: number = Infinity ): string
{
    if( limit <= 0 ) return "...";
    const tag = t[0];
    if( tag === PrimType.Struct )
    {
        return "struct(" + (
            structDefToString( t[1] as StructDefinition, limit - 1 )
        ) + ")";
    }
    if( tag === PrimType.Sop )
        {
            return "sop(" + (
                structDefToString( t[1] as StructDefinition, limit - 1 )
            ) + ")";
        }
    if( isTaggedAsAlias( t ) )
    {
        const aliased = termTypeToString( unwrapAlias( t as any ), limit - 1 );
        return "alias(" + aliased + ")";
    }
    if( tag === PrimType.AsData )
    {
        return "asData(" + (
            termTypeToString( t[1], limit - 1 )
        ) + ")";
    }
    if( tag === PrimType.List )
    {
        return "list(" + (
            termTypeToString( t[1], limit - 1 )
        ) + ")";
    }
    if( tag === PrimType.Delayed )
    {
        return "delayed(" + (
            termTypeToString( t[1], limit - 1 )
        ) + ")";
    }
    if( tag === PrimType.Pair )
    {
        return "pair(" + (
            termTypeToString( t[1], limit - 1 )
        ) + "," + (
            termTypeToString( t[2], limit - 1 )
        ) + ")";
    }

    if( tag === PrimType.Lambda )
    {
        return "(" + termTypeToString( t[1], limit - 1 ) + " -> " + termTypeToString( t[2], limit - 1 )+")";
    }

    if( typeof t[0] === "symbol" ) return "tyParam("+ ((t[0] ).description ?? "") +")";

    if( !t.slice ) {
        console.log( t );
        // return "";
    }
    const tyArgs = t.slice(1) as TermType[];
    return ( t[0] + (tyArgs.length > 0 ? ',': "") + tyArgs.map( t => termTypeToString( t, limit - 1 ) ).toString() );
}

export interface CtorDefJson {
    [ field: string ]: TermTypeJson;
}

export interface StructDefJson {
    [ ctor: string ]: CtorDefJson
}

export function ctorDefToJson( ctorDef: StructCtorDef ): CtorDefJson
{
    const fields = Object.keys( ctorDef );

    let res: CtorDefJson = {};

    for( const fieldName of fields )
    {
        res[ fieldName ] = termTypeToJson( ctorDef[ fieldName ] );
    }

    return res;
}

export function ctorDefFromJson( j: CtorDefJson ): StructCtorDef
{
    const fields = Object.keys( j );

    let res: StructCtorDef = {};

    for( const fieldName of fields )
    {
        res[ fieldName ] = termTypeFromJson( j[ fieldName ] );
    }

    return res;
}

export function structDefToJson( def: StructDefinition ): StructDefJson
{
    const ctors = Object.keys( def );

    let res: StructDefJson = {};

    for( const ctor of ctors )
    {
        res[ ctor ] = ctorDefToJson( def[ctor] );
    }

    return res;
}

export function structDefFromJson( j: StructDefJson ): StructDefinition
{
    const ctors = Object.keys( j );

    let res: StructDefinition = {};

    for( const ctor of ctors )
    {
        res[ ctor ] = ctorDefFromJson( j[ctor] );
    }

    return res;
}

export type TermTypeJson
    = TermTypeJsonAlias
    | TermTypeJsonAsData
    | TermTypeJsonList
    | TermTypeJsonDelayed
    | TermTypeJsonPair
    | TermTypeJsonLambda
    | TermTypeJsonTyParam
    | TermTypeJsonStruct
    | TermTypeJsonSop
    | PrimType.Int | PrimType.BS | PrimType.Str | PrimType.Unit | PrimType.Bool | PrimType.Data;

export interface TermTypeJsonAlias { alias: TermTypeJson }
export interface TermTypeJsonAsData { asData: TermTypeJson }
export interface TermTypeJsonList { list: TermTypeJson }
export interface TermTypeJsonDelayed { delayed: TermTypeJson }
export interface TermTypeJsonPair { pair: { fst: TermTypeJson, snd: TermTypeJson } }
export interface TermTypeJsonLambda { lambda: { input: TermTypeJson, output: TermTypeJson } }
export interface TermTypeJsonTyParam { tyParam: null }
export interface TermTypeJsonStruct { struct: StructDefJson }
export interface TermTypeJsonSop { sop: StructDefJson }

export function termTypeToJson( t: GenericTermType ): TermTypeJson
{
    const tag = t[0];

    if( typeof tag === "symbol" ) return { tyParam: null };

    if( tag === PrimType.Alias || isTaggedAsAlias( t ) )
    {
        return {
            alias: termTypeToJson( unwrapAlias( t as any ) )
        };
    }

    if( tag === PrimType.Struct )
    {
        return {
            struct: structDefToJson( t[1] as any )
        };
    }
    if( tag === PrimType.Sop )
    {
        return {
            sop: structDefToJson( t[1] as any )
        };
    }
    if( tag === PrimType.AsData )
    {
        return {
            asData: termTypeToJson( t[1] )
        };
    }
    if( tag === PrimType.List )
    {
        return {
            list: termTypeToJson( t[1] )
        };
    }
    if( tag === PrimType.Pair )
    {
        return {
            pair: {
                fst: termTypeToJson( t[1] ),
                snd: termTypeToJson( t[2] )
            }
        };
    }
    if( tag === PrimType.Delayed )
    {
        return {
            delayed: termTypeToJson( t[1] )
        };
    }
    if( tag === PrimType.Lambda )
    {
        return {
            lambda: {
                input: termTypeToJson( t[1] ),
                output: termTypeToJson( t[2] )
            }
        }
    }

    return tag as TermTypeJson;
}

export function termTypeFromJson( json: TermTypeJson ): TermType
{
    if( typeof json === "string" ) return [ json ];
    if( !isObject( json ) ) throw new Error("unexpected json format for 'TermTypeJson'; not an object");
    const keys = Object.keys( json );
    if( keys.length !== 1 ) throw new Error("unexpected json format for 'TermTypeJson'; too many keys");
    const tag = keys[0];

    const j: any = json; 

    if( tag === "alias" ) return alias( termTypeFromJson( j[ tag ] ) );
    if( tag === "asData" ) return asData( termTypeFromJson( j[ tag ] ) );
    if( tag === "list" ) return list( termTypeFromJson( j[ tag ] ) );
    if( tag === "delayed" ) return delayed( termTypeFromJson( j[ tag ] ) );

    if( tag === "pair" ) return pair(
        termTypeFromJson( j["pair"]["fst"] ),
        termTypeFromJson( j["pair"]["snd"] )
    );
    if( tag === "lambda" ) return lam(
        termTypeFromJson( j["lambda"]["input"] ),
        termTypeFromJson( j["lambda"]["output"] )
    );
    if( tag === "struct" ) return struct( structDefFromJson( j[tag] ) );
    if( tag === "tyParam" ) return tyVar() as any;

    throw new Error("unexpected json format for 'TermTypeJson'; unknonw key: " + tag);
}