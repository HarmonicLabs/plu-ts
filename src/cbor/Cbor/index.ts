import JsRuntime from "../../utils/JsRuntime";

import type { CborObj } from "../CborObj";
import { CborString } from "../CborString";
import { isCborObj } from "../CborObj";
import { isMajorTypeTag, MajorType } from "./Constants";
import { CborBytes } from "../CborObj/CborBytes";
import { CborText } from "../CborObj/CborText";
import { CborArray } from "../CborObj/CborArray";
import { CborMap, CborMapEntry } from "../CborObj/CborMap";
import { CborTag } from "../CborObj/CborTag";
import { CborSimple } from "../CborObj/CborSimple";
import { CborUInt } from "../CborObj/CborUInt";
import { CborNegInt } from "../CborObj/CborNegInt";
import { PlutsCborParseError } from "../../errors/PlutsSerialError/PlutsCborError/PlutsCborParseError";
import { fromUtf8, isUint8Array, readBigUInt64BE, readUInt16BE, readUInt32BE, readUInt8, toUtf8, writeBigUInt64BE, writeFloat64BE, writeUInt16BE, writeUInt32BE, writeUInt8 } from "../../uint8Array";

/**
 * @private to the module; not needed elsewhere
 */
class CborEncoding
{
    private _buff: Uint8Array;
    private _len: number;

    get bytes(): Uint8Array
    {
        return this._buff.slice( 0, this._len )
    }

    constructor()
    {
        this._buff = new Uint8Array(256); // (1 << 8) bytes, 1/4 kB
        this._len = 0;
    }

    private _prepareAppendOfByteLength( l: number ): void
    {
        const requiredLen = this._len + l;
        let newBuffLen = this._buff.byteLength;

        // expand the Uint8Array if needed
        while( newBuffLen < requiredLen )
        {
            newBuffLen = newBuffLen << 1; // old length * 2
        }

        // copies the old Uint8Array if expanded
        if( newBuffLen !== this._buff.byteLength )
        {
            const newBuff = new Uint8Array( newBuffLen );


            for(let i = 0; i < this._len; i++)
            {
                writeUInt8( newBuff, readUInt8( this._buff, i ), i );
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

        writeUInt8( this._buff, uint8, this._len );

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

        writeUInt16BE( this._buff, uint16, this._len );

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

        writeUInt32BE( this._buff, uint32, this._len );

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

        writeBigUInt64BE( this._buff, uint64, this._len );

        this._commitAppendOfByteLength( 8 );
    }

    appendFloat64( float64: number ): void
    {
        JsRuntime.assert(
            typeof float64 === "number",
            "expected 8 bytes; got: " + float64
        );

        this._prepareAppendOfByteLength( 8 );

        writeFloat64BE( this._buff, float64, this._len );

        this._commitAppendOfByteLength( 8 );
    }

    appendRawBytes( bytes: Uint8Array )
    {
        JsRuntime.assert(
            isUint8Array( bytes ),
            "invalid bytes passed"
        );
        
        this._prepareAppendOfByteLength( bytes.length );
        for( let i = 0; i < bytes.length; i++ )
        {
            writeUInt8( this._buff, readUInt8( bytes, i ) , this._len + i );
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
            return;
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

        if( cObj instanceof CborUInt )
        {
            JsRuntime.assert(
                cObj.num >= BigInt( 0 ),
                "encoding invalid unsigned integer as CBOR"
            );
            this.appendTypeAndLength( MajorType.unsigned, cObj.num );
            return;
        }

        if( cObj instanceof CborNegInt )
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
            const bs = fromUtf8( cObj.text );
            this.appendTypeAndLength( MajorType.text , bs.length );
            this.appendRawBytes( bs );
            return;
        }

        if( cObj instanceof CborArray )
        {
            const arr = cObj.array;
            const arrLen = arr.length;

            if( cObj.indefinite )
                this.appendUInt8( 0x9f );
            else
                this.appendTypeAndLength( MajorType.array, arrLen );

            for( let i = 0; i < arrLen; i++ )
            {
                this.appendCborObjEncoding( arr[i] );
            }

            if( cObj.indefinite )
                this.appendUInt8( 0xff );
                
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
 * static class that allows CBOR encoding and decoding
 * 
 * >**_NOTE:_** some tags that are not defined in the proper CBOR specification are automaticaly treated as PlutusData
 */
export class Cbor
{
    private constructor() {}; // static class, working as namespace

    public static encode( cborObj: CborObj ): CborString
    {
        const encoded = new CborEncoding();

        encoded.appendCborObjEncoding( cborObj );

        return new CborString( encoded.bytes );
    }

    public static parse( cbor: CborString | Uint8Array ): CborObj
    {
        JsRuntime.assert(
            isUint8Array( cbor ) || CborString.isStrictInstance( cbor ),
            "in 'Cbor.parse' expected an instance of 'CborString' or a 'Uint8Array' as input; got: " + cbor
        );
        
        const bytes: Uint8Array = cbor instanceof CborString ?
            cbor.asBytes :
            cbor;

        /**
         * number of bytes red
         * */
        let offset: number = 0;

        function incrementOffsetBy( l: number ): void
        {
            offset += l;
        }

        function getBytesOfLength( l: number ): Uint8Array
        {
            incrementOffsetBy( l );
            return bytes.slice(
                    offset - l, // offset has been incremented prior reading
                    offset
                )
        }

        function getUInt8(): CborUInt
        {
            incrementOffsetBy( 1 );
            return new CborUInt(
                readUInt8(
                    bytes,
                    offset - 1 // offset has been incremented prior reading
                )
            )
        };

        function getUInt16(): CborUInt
        {
            incrementOffsetBy( 2 );
            return new CborUInt(
                readUInt16BE(
                    bytes,
                    offset - 2 // offset has been incremented prior reading
                )
            )
        };

        function getUInt32(): CborUInt
        {
            incrementOffsetBy( 4 );
            return new CborUInt(
                readUInt32BE(
                    bytes,
                    offset - 4 // offset has been incremented prior reading
                )
            )
        };

        function getUInt64(): CborUInt
        {
            incrementOffsetBy( 8 );
            return new CborUInt(
                readBigUInt64BE(
                    bytes,
                    offset - 8 // offset has been incremented prior reading
                )
            )
        };

        function getFloat16(): CborSimple
        {
            // increments the offset here
            const floatBits = Number( getUInt16().num );

            let tempArrayBuffer = new ArrayBuffer(4);
            let tempDataView = new DataView(tempArrayBuffer);

            const sign =      floatBits & 0b1_00000_0000000000;
            let exponent =    floatBits & 0b0_11111_0000000000;
            let fraction =    floatBits & 0b0_00000_1111111111;

            if (exponent === 0x7c00)
                exponent = 0xff << 10;
            else if (exponent !== 0)
                exponent += (127 - 15) << 10;
            else if (fraction !== 0)
                return new CborSimple(
                    (sign !== 0 ? -1 : 1) * fraction * 5.960464477539063e-8,
                    "float"
                );
            
            tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);

            return new CborSimple(
                tempDataView.getFloat32( 0 ),
                "float"
            );
        }

        function getFloat32(): CborSimple
        {
            incrementOffsetBy( 4 );
            return new CborSimple(
                readFloat32BE(
                    bytes,
                    offset - 4 // offset has been incremented prior reading
                ),
                "float"
            );
        }

        function getFloat64(): CborSimple
        {
            incrementOffsetBy( 8 );
            return new CborSimple(
                readFloat64BE(
                    bytes,
                    offset - 8 // offset has been incremented prior reading
                ),
                "float"
            );
        }

        function incrementIfBreak(): boolean
        {
            if( readUInt8( bytes, offset ) !== 0xff ) return false;
            incrementOffsetBy( 1 );
            return true;
        }

        function getLength( addInfos: number ): bigint
        {
            if (addInfos < 24)
                return BigInt( addInfos );
            if (addInfos === 24)
                return getUInt8().num;
            if (addInfos === 25)
                return getUInt16().num;
            if (addInfos === 26)
                return getUInt32().num;
            if (addInfos === 27)
                return getUInt64().num;
            if (addInfos === 31)
                return BigInt( -1 ); // indefinite length element follows

            throw new PlutsCborParseError( "Invalid length encoding while parsing CBOR" );
        }

        function getIndefiniteElemLengthOfType( majorType: MajorType ): bigint
        {
            const headerByte = Number( getUInt8().num );

            if( headerByte === 0xff ) // breack indefinite
                return BigInt( -1 );
            
            const elemLength = getLength( headerByte & 0b000_11111 );

            if( elemLength <  0 || (headerByte >> 5 !== majorType ) )
                throw new PlutsCborParseError( "unexpected nested indefinite length element" );

            return elemLength;
        }

        function getTextOfLength( l: number ): string
        {
            // increments offset while getting the bytes
            return toUtf8( getBytesOfLength( l ) );
        }

        function parseCborObj(): CborObj
        {
            const headerByte = Number( getUInt8().num );
            const major : MajorType = headerByte >> 5;
            const addInfos = headerByte & 0b000_11111;

            if( major === MajorType.float_or_simple )
            {
                if( addInfos === 25 ) return getFloat16();
                if( addInfos === 26 ) return getFloat32();
                if( addInfos === 27 ) return getFloat64();
            }

            const length = getLength( addInfos );

            if( length < 0 &&
                ( major < 2 || major > 6 )
            )
            {
                throw new PlutsCborParseError( "unexpected indefinite length element while parsing CBOR" );
            }

            switch( major )
            {
                case MajorType.unsigned: return new CborUInt( length );
                case MajorType.negative: return new CborNegInt( -BigInt( 1 ) -length );
                case MajorType.bytes:

                    if (length < 0) // data in UPLC v1.*.* serializes as indefinite length
                    {
                        const chunks: Uint8Array[] = [];
                        let fullUint8ArrayLength: number = 0;

                        let elementLength: bigint;
                        while ( (elementLength = getIndefiniteElemLengthOfType( major ) ) >= 0)
                        {
                            fullUint8ArrayLength += Number( elementLength );
                            chunks.push(
                                getBytesOfLength( // increments offset
                                    Number( elementLength )
                                )
                            );
                        }

                        let fullUint8Array = new Uint8Array(fullUint8ArrayLength);
                        let fullUint8ArrayOffset = 0;

                        for (let i = 0; i < chunks.length; ++i)
                        {
                          fullUint8Array.set(chunks[i], fullUint8ArrayOffset);
                          fullUint8ArrayOffset += chunks[i].length;
                        }

                        return new CborBytes(
                            Uint8Array.from( fullUint8Array )
                        );
                    }
                    
                    // definite length
                    return new CborBytes(
                        getBytesOfLength( Number( length ) )
                    );

                case MajorType.text:
                    
                    if( length < 0 ) // indefinite length
                    {
                        let str = "";
                        let l: number = 0;

                        while(
                            (
                                l = Number( getIndefiniteElemLengthOfType( MajorType.text ) )
                            ) >= 0
                        )
                        {
                            str += getTextOfLength( l );
                        }

                        return new CborText( str );
                    }

                    return new CborText( getTextOfLength( Number( length ) ) );

                case MajorType.array:

                    const arrOfCbors: CborObj[] = [];

                    if( length < 0 )
                    {
                        while( !incrementIfBreak() )
                        {
                            arrOfCbors.push( parseCborObj() );
                        }
                    }
                    else
                    {
                        for( let i = 0; i < length; i++ )
                        {
                            arrOfCbors.push( parseCborObj() );
                        }
                    }

                    return new CborArray( arrOfCbors );

                case MajorType.map:

                    const entries: CborMapEntry[] = [];

                    if( length < 0 )
                    {
                        while( !incrementIfBreak() )
                        {
                            entries.push({
                                k: parseCborObj(),
                                v: parseCborObj()
                            });
                        }
                    }
                    else
                    {
                        for ( let i = 0; i < length ; i++ )
                        {
                            entries.push({
                                k: parseCborObj(),
                                v: parseCborObj()
                            });
                        }
                    }

                    return new CborMap( entries );

                case MajorType.tag:
                    return new CborTag( Number( length ) , parseCborObj() );

                case MajorType.float_or_simple:
                    
                    const nLen = Number( length );

                    if( nLen === 20 ) return new CborSimple( false );       // f4
                    if( nLen === 21 ) return new CborSimple( true );        // f5
                    if( nLen === 22 ) return new CborSimple( null );        // f6
                    if( nLen === 23 ) return new CborSimple( undefined );   // f7

                    // flaots handled at the beginning of the function
                    // since length isn't required

                    throw new PlutsCborParseError(
                        "unrecognized simple value"
                    );

                default:
                    throw new PlutsCborParseError(
                        "unrecognized majorType: " + major
                    );
            }
        }

        return parseCborObj();
    }
}