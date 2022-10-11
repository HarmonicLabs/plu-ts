/*
Intermediate data type that allows an easier conversion from (and to) CBOR to (and from) JSON serializables objects
*/

import JsRuntime from "../../utils/JsRuntime";
import CborArray, { isRawCborArray, RawCborArray } from "./CborArray";
import CborBytes, { isRawCborBytes, RawCborBytes } from "./CborBytes";
import CborMap, { isRawCborMap, RawCborMap } from "./CborMap";
import CborNegInt, { RawCborNegInt, isRawCborNegative } from "./CborNegInt";
import CborSimple, { isRawCborSimple, isSimpleCborValue, RawCborSimple } from "./CborSimple";
import CborTag, { isRawCborTag, RawCborTag } from "./CborTag";
import CborText, { isRawCborText, RawCborText } from "./CborText";
import CborUInt, { RawCborUInt, isRawCborUnsigned } from "./CborUInt";

export  type RawCborObj
    = RawCborUInt
    | RawCborNegInt
    | RawCborBytes
    | RawCborText
    | RawCborArray
    | RawCborMap
    | RawCborTag
    | RawCborSimple;

type CborObj
    = CborNegInt
    | CborUInt
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
        proto === CborNegInt.prototype ||
        proto === CborUInt.prototype ||
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
    if( typeof rawCborObj !== "object" || rawCborObj === null || Array.isArray( rawCborObj ) ) return false;

    const keys = Object.keys( rawCborObj );

    if( keys.length <= 0 || keys.length > 2 ) return false;

    if( keys.length === 2 )
        return keys.includes( "tag" ) && keys.includes( "data" ) &&
            isRawCborObj( (rawCborObj as RawCborTag).data );
    
    const k = keys[0];

    return (
        ( k === "neg"                                              &&
        typeof (rawCborObj as RawCborNegInt).neg === "bigint" &&
        (rawCborObj as RawCborNegInt).neg < 0 )                                                 ||
        ( k === "uint" &&
        typeof (rawCborObj as RawCborUInt).uint === "bigint" &&
        (rawCborObj as RawCborUInt).uint >= 0)                                                  ||
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

export function cborObjFromRaw( _rawCborObj: RawCborObj ): CborObj
{
    JsRuntime.assert(
        isRawCborObj( _rawCborObj ),
        "expected a vaild 'RawCborObj' as input; got: " + _rawCborObj
    );

    function _cborObjFromRaw( rawCborObj: RawCborObj ): CborObj
    {
        if( isRawCborNegative( rawCborObj as RawCborNegInt ) )
            return new CborNegInt( (rawCborObj as RawCborNegInt).neg );

        if( isRawCborUnsigned( rawCborObj as RawCborUInt ) )
            return new CborUInt( (rawCborObj as RawCborUInt).uint );

        if( isRawCborBytes( rawCborObj as RawCborBytes ) )
            return new CborBytes( (rawCborObj as RawCborBytes).bytes );

        if( isRawCborText( rawCborObj as RawCborText ) )
            return new CborText( (rawCborObj as RawCborText).text );

        if( isRawCborArray( rawCborObj as RawCborArray ) )
            return new CborArray(
                (rawCborObj as RawCborArray).array
                .map( _cborObjFromRaw )
            );

        if( isRawCborMap( rawCborObj as RawCborMap ) )
            return new CborMap(
                (rawCborObj as RawCborMap).map
                .map( entry => {
                    return {
                        k: _cborObjFromRaw( entry.k ),
                        v: _cborObjFromRaw( entry.v )
                    }
                })
            );

        if( isRawCborTag( rawCborObj as RawCborTag ) )
            return new CborTag( (rawCborObj as RawCborTag).tag, _cborObjFromRaw( (rawCborObj as RawCborTag).data ) );

        if( isRawCborSimple( rawCborObj as RawCborSimple ) )
            return new CborSimple( (rawCborObj as RawCborSimple).simple );

        throw JsRuntime.makeNotSupposedToHappenError(
            "'cborObjFromRaw' did not match any possible 'RawCborObj'"
        );
    }

    return _cborObjFromRaw( _rawCborObj );
}