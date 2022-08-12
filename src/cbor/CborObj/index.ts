/*
Intermediate data type that allows an easier conversion from (and to) CBOR to (and from) JSON serializables objects
*/

import JsRuntime from "../../utils/JsRuntime";
import CborArray, { isRawCborArray, RawCborArray } from "./CborArray";
import CborBytes, { isRawCborBytes, RawCborBytes } from "./CborBytes";
import CborMap, { isRawCborMap, RawCborMap } from "./CborMap";
import CborNegativeInt, { isRawCborNegative, RawCborNegativeInt } from "./CborNegativeInt";
import CborSimple, { isRawCborSimple, isSimpleCborValue, RawCborSimple } from "./CborSimple";
import CborTag, { isRawCborTag, RawCborTag } from "./CborTag";
import CborText, { isRawCborText, RawCborText } from "./CborText";
import CborUnsignedInt, { isRawCborUnsigned, RawCborUnsignedInt } from "./CborUnsignedInt";

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
    const proto = Object.getPrototypeOf( cborObj );
    
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