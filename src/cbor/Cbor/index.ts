/*

 
*/
import { Buffer } from "buffer";
import CborString from "../CborString";
import CborObj, { isCborObj } from "../CborObj";
import JsRuntime from "../../utils/JsRuntime";
import CborConstants, { isMajorTypeTag, MajorType } from "./Constants";
import CborUnsignedInt from "../CborObj/CborUnsignedInt";
import CborNegativeInt from "../CborObj/CborNegativeInt";
import CborBytes from "../CborObj/CborBytes";
import CborText from "../CborObj/CborText";
import CborArray from "../CborObj/CborArray";
import CborMap from "../CborObj/CborMap";
import CborTag from "../CborObj/CborTag";
import CborSimple from "../CborObj/CborSimple";
import BufferUtils from "../../utils/BufferUtils";


/**
 * @private to the module; not needed elsewhere
 */
class CborEncoding
{
    private _buff: Buffer;
    private _len: number;

    get bytes(): Buffer
    {
        return BufferUtils.copy(
            this._buff.slice( 0, this._len )
        );
    }

    constructor()
    {
        this._buff = Buffer.allocUnsafe(256); // (1 << 8) bytes, 1/4 kB
        this._len = 0;
    }

    private _prepareAppendOfByteLength( l: number ): void
    {
        const requiredLen = this._len + l;
        let newBuffLen = this._buff.byteLength;

        // expand the buffer if needed
        while( newBuffLen < requiredLen )
        {
            newBuffLen = newBuffLen << 1; // old length * 2
        }

        // copies the old buffer if expanded
        if( newBuffLen !== this._buff.byteLength )
        {
            const newBuff = Buffer.allocUnsafe( newBuffLen );

            for(let i = 0; i < this._len; i++)
            {
                newBuff.writeUInt8( this._buff.readUInt8( i ), i );
            }

            this._buff = newBuff;
        }
    }

    private _commitAppendOfByteLength( l: number ): void
    {
        this._len += l;
    }

    appendUInt8( uint8: number ): void
    {
        JsRuntime.assert(
            uint8 >= 0 && uint8 <= 0b1111_1111 &&
            uint8 === Math.round( uint8 ),
            "expected a byte; got: " + uint8
        );

        this._prepareAppendOfByteLength( 1 );

        this._buff.writeUInt8( uint8, this._len );

        this._commitAppendOfByteLength( 1 );
    }

    appendUInt16( uint16: number ): void
    {
        JsRuntime.assert(
            uint16 >= 0 && uint16 <= 0b1111_1111_1111_1111 &&
            uint16 === Math.round( uint16 ),
            "expected two bytes; got: " + uint16
        );

        this._prepareAppendOfByteLength( 2 );

        this._buff.writeUInt16BE( uint16, this._len );

        this._commitAppendOfByteLength( 2 );
    }

    appendUInt32( uint32: number ): void
    {
        JsRuntime.assert(
            uint32 >= 0 && uint32 <= 0b11111111_11111111_11111111_11111111 &&
            uint32 === Math.round( uint32 ),
            "expected 4 bytes; got: " + uint32
        );

        this._prepareAppendOfByteLength( 4 );

        this._buff.writeUInt32BE( uint32, this._len );

        this._commitAppendOfByteLength( 4 );
    }

    appendUInt64( uint64: bigint ): void
    {
        JsRuntime.assert(
            typeof uint64 === "bigint" &&
            uint64 >= BigInt( 0 ) && uint64 <= BigInt( "0b" + "11111111".repeat( 8 ) ),
            "expected 8 bytes; got: " + uint64
        );

        this._prepareAppendOfByteLength( 8 );

        this._buff.writeBigUInt64BE( uint64, this._len );

        this._commitAppendOfByteLength( 8 );
    }

    appendFloat64( float64: number ): void
    {
        JsRuntime.assert(
            typeof float64 === "number",
            "expected 8 bytes; got: " + float64
        );

        this._prepareAppendOfByteLength( 8 );

        this._buff.writeDoubleBE( float64, this._len );

        this._commitAppendOfByteLength( 8 );
    }

    appendRawBytes( bytes: Buffer )
    {
        JsRuntime.assert(
            Buffer.isBuffer( bytes ),
            "invalid bytes passed"
        );
        
        this._prepareAppendOfByteLength( bytes.length );
        for( let i = 0; i < bytes.length; i++ )
        {
            this._buff.writeUInt8( bytes.readUInt8( i ) , this._len + i );
        }
        this._commitAppendOfByteLength( bytes.length );
    }

    appendTypeAndLength( cborType: MajorType , length: number | bigint ): void
    {
        JsRuntime.assert(
            isMajorTypeTag( cborType ),
            "passed tag is not a valid major cbor type"
        );

        JsRuntime.assert(
            (typeof length === "number" || typeof length === "bigint") &&
            length >= 0,
            "invalid length"
        );

        if( length > 0b11111111_11111111_11111111_11111111 )
        {
            if( typeof length === "number" ) length = BigInt( length );
            
            this.appendUInt8( (cborType << 5) | 27 /*expect_uint64*/ );
            this.appendUInt64( length );
        }

        if( typeof length === "bigint" ) length = Number( length );

        if (length < 24)
        {
            this.appendUInt8(
                (cborType << 5) | length
            );
        }
        else if ( length < 0x100 )
        {
            this.appendUInt8(
                (cborType << 5 ) | 24
            );
            this.appendUInt8( length );
        }
        else if (length < 0x10000)
        {
            this.appendUInt8(
                (cborType << 5) | 25
            );
            this.appendUInt16( length );
        }
        else /* if (length < 0x100000000) */
        {
            this.appendUInt8(
                (cborType << 5) | 26
            );
            this.appendUInt32( length );
        }
    }

    appendCborObjEncoding( cObj: CborObj ): void
    {
        JsRuntime.assert(
            isCborObj( cObj ),
            "expected 'CborObj' strict instance; got: " + cObj
        );

        if( cObj instanceof CborUnsignedInt )
        {
            JsRuntime.assert(
                cObj.num >= BigInt( 0 ),
                "encoding invalid unsigned integer as CBOR"
            );
            this.appendTypeAndLength( MajorType.unsigned, cObj.num );
            return;
        }

        if( cObj instanceof CborNegativeInt )
        {
            JsRuntime.assert(
                cObj.num < BigInt( 0 ),
                "encoding invalid negative integer as CBOR"
            );
            this.appendTypeAndLength( MajorType.negative , -(cObj.num + BigInt( 1 ) ) );
            return;
        }

        if( cObj instanceof CborBytes )
        {
            const bs = cObj.buffer;
            this.appendTypeAndLength( MajorType.bytes , bs.length );
            this.appendRawBytes( bs );
            return;
        }

        if( cObj instanceof CborText )
        {
            const bs = Buffer.from( cObj.text, "utf-8" );
            this.appendTypeAndLength( MajorType.text , bs.length );
            this.appendRawBytes( bs );
            return;
        }

        if( cObj instanceof CborArray )
        {
            const arr = cObj.array;

            this.appendTypeAndLength( MajorType.array, arr.length );
            for( let i = 0; i < arr.length; i++ )
            {
                this.appendCborObjEncoding( arr[i] );
            }

            return;
        }

        if( cObj instanceof CborMap )
        {
            const map = cObj.map;

            this.appendTypeAndLength( MajorType.map, map.length );
            for( let i = 0; i < map.length; i++ )
            {
                this.appendCborObjEncoding( map[i].k );
                this.appendCborObjEncoding( map[i].v );
            }

            return;
        }

        if( cObj instanceof CborTag )
        {
            this.appendTypeAndLength( MajorType.tag, cObj.tag );
            this.appendCborObjEncoding( cObj.data )
            return;
        }

        if( cObj instanceof CborSimple )
        {
            const simpValue = cObj.simple;

            if (simpValue === false)
                return this.appendUInt8(0xf4); // major type 6 (tag) | 20
            if (simpValue === true)
                return this.appendUInt8(0xf5); // major type 6 (tag) | 21
            if (simpValue === null)
                return this.appendUInt8(0xf6); // major type 6 (tag) | 22
            if (simpValue === undefined)
                return this.appendUInt8(0xf7); // major type 6 (tag) | 23

            if( cObj.numAs === "simple" &&
                simpValue >= 0 && simpValue <= 255 &&
                simpValue === Math.round( simpValue ) 
            )
            {
                this.appendTypeAndLength( MajorType.float_or_simple, simpValue );
                return;
            }

            this.appendUInt8(0xfb) // (MajorType.float_or_simple << 5) | 27 (double precidison float)
            this.appendFloat64( simpValue );

            return;
        }

        throw JsRuntime.makeNotSupposedToHappenError(
            "'CborEncoding.appendCborObjEncoding' did not match any possible 'CborObj'"
        );
    }

}

/**
 * @private to the module; not needed elsewhere
 */
 class CborDecodingCtx
 {
    private _offset: number;
    get offset(): number { return this._offset; }

    constructor()
    {
        this._offset = 0;
    }
 }

/**
 * static class that allows CBOR encoding and decoding
 * 
 * >**_NOTE:_** some tags that are not defined in the proper CBOR specification are automaticaly treated as PlutusData
 */
export default class Cbor
{
    private constructor() {}; // static class, working as namespace

    public static encode( cborObj: CborObj ): CborString
    {
        const encoded = new CborEncoding();

        encoded.appendCborObjEncoding( cborObj );

        return new CborString( encoded.bytes );
    }

    public static parse( cbor: CborString | Buffer ): CborObj
    {
        JsRuntime.assert(
            Buffer.isBuffer( cbor ) || CborString.isStrictInstance( cbor ),
            "in 'Cbor.parse' expected an instance of 'CborString' or a 'Buffer' as input; got: " + cbor
        );
        
        const bytes: Buffer = cbor instanceof CborString ?
            cbor.asBytes :
            cbor;

        const ctx = new CborDecodingCtx();
        
    }
}