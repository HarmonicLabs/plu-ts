/*
Intermediate data type that allows an easier conversion from (and to) CBOR to (and from) JSON serializables objects
*/

import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import CborArray, { RawCborArray } from "./CborArray";
import CborBytes, { RawCborBytes } from "./CborBytes";
import CborMap, { RawCborMap } from "./CborMap";
import CborNegativeInt, { RawCborNegativeInt } from "./CborNegativeInt";
import CborSimple, { isSimpleCborValue, RawCborSimple } from "./CborSimple";
import CborTag, { RawCborTag } from "./CborTag";
import CborText, { RawCborText } from "./CborText";
import CborUnsignedInt, { RawCborUnsignedInt } from "./CborUnsignedInt";

export  type RawCborObj
    = RawCborUnsignedInt
    | RawCborNegativeInt
    | RawCborBytes
    | RawCborText
    | RawCborArray
    | RawCborMap
    | RawCborTag
    | RawCborSimple;

type CborObj
    = CborNegativeInt
    | CborUnsignedInt
    | CborBytes
    | CborText
    | CborArray
    | CborMap
    | CborTag
    | CborSimple;

export default CborObj;


export function isCborObj( cborObj: CborObj ): boolean
{
    const proto = (cborObj as any).__proto__;
    
    // only strict instances
    return (
        proto === CborNegativeInt.prototype ||
        proto === CborUnsignedInt.prototype ||
        proto === CborBytes.prototype       ||
        proto === CborText.prototype        ||
        proto === CborArray.prototype       ||
        proto === CborMap.prototype         ||
        proto === CborTag.prototype         ||
        proto === CborSimple.prototype
    )
}

export function isRawCborObj( rawCborObj: RawCborObj ): boolean
{
    if( typeof rawCborObj !== "object" )  return false;

    const keys = Object.keys( rawCborObj );

    if( keys.length <= 0 || keys.length > 2 ) return false;

    if( keys.length === 2 )
        return keys.includes( "tag" ) && keys.includes( "data" ) &&
            isRawCborObj( (rawCborObj as RawCborTag).data );
    
    const k = keys[0];

    return (
        ( k === "negative" && typeof (rawCborObj as RawCborNegativeInt).negative === "bigint" ) || 
        ( k === "unsigned" && typeof (rawCborObj as RawCborUnsignedInt).unsigned === "bigint" ) ||
        ( k === "bytes" && Buffer.isBuffer( (rawCborObj as RawCborBytes).bytes ) )              ||
        ( k === "text" && typeof (rawCborObj as RawCborText).text === "string")                 ||

        ( k === "array" && Array.isArray( (rawCborObj as RawCborArray).array ) &&
            (rawCborObj as RawCborArray).array.every( isRawCborObj ) 
        )                                                                                       ||

        ( k === "map" && Array.isArray( (rawCborObj as RawCborMap).map ) && 
        (rawCborObj as RawCborMap).map.every(
                entry => isRawCborObj( entry.k ) && isRawCborObj( entry.v )
            )
        )                                                                                       ||

        // tag done in the two keys case

        ( k === "simple" && isSimpleCborValue( (rawCborObj as RawCborSimple).simple ) )
    );
}

export function isRawCborNegative( neg: RawCborNegativeInt ): boolean
{
    if( typeof neg !== "object" ) return false;
    
    const keys = Object.keys( neg );

    return (
        keys.length === 1 &&
        keys[0] === "negative"  &&
        typeof neg.negative === "bigint"
    );
}

export function isRawCborUnsigned( unsign: RawCborUnsignedInt ): boolean
{
    if( typeof unsign !== "object" ) return false;
    
    const keys = Object.keys( unsign );

    return (
        keys.length === 1 &&
        keys[0] === "unsigned"  &&
        typeof unsign.unsigned === "bigint"
    );
}

export function isRawCborBytes( b: RawCborBytes ): boolean
{
    if( typeof b !== "object" ) return false;
    
    const keys = Object.keys( b );

    return (
        keys.length === 1 &&
        keys[0] === "bytes"  &&
        Buffer.isBuffer( b.bytes )
    );
}

export function isRawCborText( t: RawCborText ): boolean
{
    if( typeof t !== "object" ) return false;

    const keys = Object.keys( t );

    return (
        keys.length === 1 &&
        keys[0] === "text" &&
        typeof t.text === "string"
    );
}

export function isRawCborArray( arr: RawCborArray ): boolean
{
    if( typeof arr !== "object" ) return false;

    const keys = Object.keys( arr );

    return (
        keys.length === 1 &&
        keys[0] === "array" &&
        Array.isArray( arr.array ) &&
        arr.array.every( isRawCborObj )
    );
}


export function isRawCborMap( m: RawCborMap ): boolean
{
    if( typeof m !== "object" ) return false;

    const keys = Object.keys( m );

    return (
        keys.length === 1 &&
        keys[0] === "map" &&
        Array.isArray( m.map ) &&
        m.map.every( entry => {
            if( typeof entry !== "object" ) return false;

            const entryKeys = Object.keys( entry ); 
            
            return (
                entryKeys.length === 2      &&
                entryKeys.includes( "k" )   &&
                isRawCborObj( entry.k )     &&
                entryKeys.includes( "v" )   &&
                isRawCborObj( entry.v )
            );
        } )
    );
}

export function isRawCborTag( t: RawCborTag ): boolean
{
    if( typeof t !== "object" ) return false;

    const keys = Object.keys( t );

    return (
        keys.length === 2 &&
        keys.includes( "tag" ) &&
        keys.includes( "data" ) &&
        typeof t.tag === "number" &&
        isRawCborObj( t.data )
    );
}

export function isRawCborSimple( s: RawCborSimple ): boolean
{
    if( typeof s !== "object" ) return false;

    const keys = Object.keys( s );

    return (
        keys.length === 1 &&
        keys[0] === "simple" &&
        isSimpleCborValue( s.simple )
    );
}

export function cborObjFromRaw( rawCborObj: RawCborObj ): CborObj
{
    JsRuntime.assert(
        isRawCborObj( rawCborObj ),
        "expected a vaild 'RawCborObj' as input; got: " + rawCborObj
    );

    if( isRawCborNegative( rawCborObj as RawCborNegativeInt ) )
        return new CborNegativeInt( (rawCborObj as RawCborNegativeInt).negative );

    if( isRawCborUnsigned( rawCborObj as RawCborUnsignedInt ) )
        return new CborUnsignedInt( (rawCborObj as RawCborUnsignedInt).unsigned );

    if( isRawCborBytes( rawCborObj as RawCborBytes ) )
        return new CborBytes( (rawCborObj as RawCborBytes).bytes );

    if( isRawCborText( rawCborObj as RawCborText ) )
        return new CborText( (rawCborObj as RawCborText).text );

    if( isRawCborArray( rawCborObj as RawCborArray ) )
        return new CborArray(
            (rawCborObj as RawCborArray).array
            .map( cborObjFromRaw )
        );

    if( isRawCborMap( rawCborObj as RawCborMap ) )
        return new CborMap(
            (rawCborObj as RawCborMap).map
            .map( entry => {
                return {
                    k: cborObjFromRaw( entry.k ),
                    v: cborObjFromRaw( entry.v )
                }
            })
        );

    if( isRawCborTag( rawCborObj as RawCborTag ) )
        return new CborTag( (rawCborObj as RawCborTag).tag, cborObjFromRaw( (rawCborObj as RawCborTag).data ) );

    if( isRawCborSimple( rawCborObj as RawCborSimple ) )
        return new CborSimple( (rawCborObj as RawCborSimple).simple );

    throw JsRuntime.makeNotSupposedToHappenError(
        "'cborObjFromRaw' did not match any possible 'RawCborObj'"
    );
}