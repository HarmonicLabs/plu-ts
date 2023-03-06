import BigIntUtils from "../../../utils/BigIntUtils";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";

import { Cbor } from "../../../cbor/Cbor";
import { CborBytes } from "../../../cbor/CborObj/CborBytes";
import { CborString } from "../../../cbor/CborString";
import { UPLCDeserializaitonError } from "../../../errors/UPLCError/UPLCDeserializationError";
import { dataFromCbor, dataFromCborObj } from "../../../types/Data/fromCbor";
import { ByteString } from "../../../types/HexString/ByteString";
import { Integer } from "../../../types/ints/Integer";
import { Pair } from "../../../types/structs/Pair";
import { UPLCProgram } from "../UPLCProgram";
import { UPLCVersion } from "../UPLCProgram/UPLCVersion";
import { PureUPLCTerm, showConstType, showUPLCConstValue } from "../UPLCTerm";
import { Application } from "../UPLCTerms/Application";
import { Builtin } from "../UPLCTerms/Builtin";
import { builtinTagToString } from "../UPLCTerms/Builtin/UPLCBuiltinTag";
import { Delay } from "../UPLCTerms/Delay";
import { ErrorUPLC } from "../UPLCTerms/ErrorUPLC";
import { Force } from "../UPLCTerms/Force";
import { Lambda } from "../UPLCTerms/Lambda";
import { UPLCVar } from "../UPLCTerms/UPLCVar";
import { UPLCConst } from "../UPLCTerms/UPLCConst";
import { ConstType, constListTypeUtils, constPairTypeUtils, constT, constTypeEq, ConstTyTag, isWellFormedConstType } from "../UPLCTerms/UPLCConst/ConstType";
import { ConstValue, ConstValueList } from "../UPLCTerms/UPLCConst/ConstValue";
import { DataB } from "../../../types/Data/DataB";
import { fromHex, toUtf8 } from "../../../uint8Array";

export type SerializedScriptFormat = "flat" | "cbor"

function isSerializedScriptFormat( str: string ): str is SerializedScriptFormat
{
    return (
        typeof str === "string" &&
        (
            str === "flat" ||
            str === "cbor"
        )
    );
}

export class UPLCDecoder
{
    private constructor() {}

    static parse( serializedScript: Uint8Array , format: SerializedScriptFormat = "cbor", debugLogs: boolean = false ): UPLCProgram
    {
        if( !isSerializedScriptFormat( format ) )
        {
            throw new UPLCDeserializaitonError( "unknown format: " + (format as any).toString() );
        }

        if( format === "cbor" )
        {
            return this.parse(
                (Cbor.parse(
                    (Cbor.parse(
                        serializedScript
                    ) as CborBytes).buffer
                ) as CborBytes).buffer,
                "flat"
            );
        }

        // -------------------------- ctx steup -------------------------- //

        let currPtr: number = 0;
        const nBytes = serializedScript.length;
        const scriptBits = "0000000" + BigIntUtils.fromBuffer( serializedScript ).toString(2);
        const version: [ number, number, number ] = [1,0,0];

        let currDbn = 0;

        function incrementPtrBy( n: number ): void 
        {
            currPtr += n;
        }

        function logState( forced: boolean = false ): void
        {
            if( forced || debugLogs )
            {
                console.log("UPLCDecoder state: " + JSON.stringify({
                    currPtr,
                    bits: "..." + scriptBits.slice( currPtr - 16, currPtr + 16 ) + "...",
                    "ptr ": ' '.repeat( 19 ) + '^',
                    currentByteIndex: currByteIndex(),
                    partialUPLC
                },undefined,2) );
            }
        }

        // --------------------------------------------------------------- //

        // ------------------------------ partial UPLC stuff ------------------------------ //

        const vars = "abcdefghilmopqrstuvzwxyjkABCDEFGHILJMNOPQRSTUVZWXYJK".split('');

        let partialUPLC = "";
        // -------------------------------------------------------------------------------- //


        function currByteIndex(): number
        {
            const idx = Math.floor( currPtr / 8 );
            if( idx >= nBytes ) throw new UPLCDeserializaitonError("pointer out of bound; ptr: " + currPtr + "; n bits: " + nBytes * 8 );
            return idx;
        }

        function currByte(): number
        {
            const byte = serializedScript.at( currByteIndex() );
            if( byte === undefined ) throw new UPLCDeserializaitonError("pointer out of bound; ptr: " + currPtr + "; n bits: " + nBytes * 8 );
            return byte;
        }

        function getByteMask( nBits: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 ): number
        {
            let mask = 0;
            for( let _nBits = Math.round( Math.abs( nBits ) ) ; _nBits > 0; _nBits--)
            {
                mask = (mask << 1) + 1;
            }
            return mask;
        }

        function nthBitOfByte( nth: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, byte: number ): 0 | 1
        {
            switch( nth )
            {
                case 0: return ((byte & 0b1000_0000) >> 7) as any;
                case 1: return ((byte & 0b0100_0000) >> 6) as any;
                case 2: return ((byte & 0b0010_0000) >> 5) as any;
                case 3: return ((byte & 0b0001_0000) >> 4) as any;
                case 4: return ((byte & 0b0000_1000) >> 3) as any;
                case 5: return ((byte & 0b0000_0100) >> 2) as any;
                case 6: return ((byte & 0b0000_0010) >> 1) as any;
                case 7: return ( byte & 0b0000_0001)       as any;

                default: throw new UPLCDeserializaitonError("can't access bit n: " + nth)
            }
        }

        function readNBits( n: number, shouldLogResult: boolean = false ): bigint
        {
            const logResult = 
                (debugLogs || shouldLogResult) ?
                ( result: bigint ): bigint =>
                {
                    return result;
                }: 
                (x: any) => x 
            ;

            if( n <= 0 ) return logResult( BigInt(0) );

            const currB = currByte();
            const inBytePtr = currPtr % 8;

            if( n === 1 ){
                incrementPtrBy( 1 );
                return logResult( 
                    BigInt(nthBitOfByte( inBytePtr as any, currB ))
                );
            }

            const missingBitsToByte = 8 - inBytePtr;

            const shift = missingBitsToByte - n;


            if( n <= missingBitsToByte )
            {
                incrementPtrBy( n );
                return logResult( 
                    BigInt(
                        (currB & ( getByteMask( n as any ) << shift )) >> shift
                    )
                );
            }

            incrementPtrBy( missingBitsToByte );
            let result = BigInt(
                currB & getByteMask( missingBitsToByte as any )
            );

            let missingBitsToRead = n - missingBitsToByte;
            let nWholeBytes = 0;
            for( ; (nWholeBytes + 1) * 8 < missingBitsToRead; nWholeBytes++ )
            {
                result = ( result << BigInt(8) ) & BigInt( currByte() );
                incrementPtrBy( 8 );
            }
            missingBitsToRead = missingBitsToRead - (nWholeBytes * 8);

            if( missingBitsToRead === 0 ) return logResult( result );
            return logResult( 
                ( result << BigInt( missingBitsToRead ) ) | readNBits(missingBitsToRead, false)
            );
        }

        function readPadding(): void
        {
            while( Number( readNBits(1) ) !== 1 ) {}
            if( (currPtr % 8) !== 0 ) throw new UPLCDeserializaitonError(
                "padding was not alligned to byte; currPtr was: " + currPtr + "; currPtr % 8: " + currPtr % 8
            )
        }

        function readUInt(): bigint
        {
            let n = BigInt(0);
            let wasLast: boolean = true;
            let nRed = 0;
            do {
                const red = readNBits(8);
                wasLast = (red & BigInt(0b1000_0000)) === BigInt( 0 );

                n = n | (red & BigInt(0b111_1111)) << BigInt( nRed * 7 );
                nRed++
            } while( !wasLast );
            return n;
        };

        function readSignedInt(): bigint
        {
            return UPLCFlatUtils.unzigzagBigint( readUInt() );
        }

        function readTerm(): PureUPLCTerm
        {
            // console.log( "left to read: " + serializedScript.subarray( currByteIndex() ).toString("hex") );

            logState();

            const tag = Number( readNBits(4) );

            switch( tag )
            {
                        // serialised debruijn starts form 1;
                        // plu-ts debruijn starts from 0
                case 0:
                    const _dbn = readUInt();
                    const dbn = Number( _dbn );
                    const idx = currDbn - (dbn - 1);
                    partialUPLC += vars[ idx ] ?? `(${idx.toString()})`;
                    return new UPLCVar( _dbn - BigInt(1) );
                case 1:
                    partialUPLC+= "(delay ";
                    const delayed = readTerm();
                    partialUPLC += ")";
                    return new Delay( delayed );
                case 2:
                    partialUPLC += "(lam " + vars[ currDbn ] + ' ';
                    currDbn++;
                    const lamBody = readTerm();
                    currDbn--;
                    partialUPLC += ")";
                    return new Lambda( lamBody );
                case 3:
                    partialUPLC += '[';
                    const appFn  = readTerm();
                    partialUPLC += ' ';
                    const appArg = readTerm();
                    partialUPLC += ']';
                    return new Application( appFn, appArg );
                case 4: return readConst();
                case 5:
                    partialUPLC += "(force ";
                    const forced = readTerm();
                    partialUPLC += ')';
                    if( forced instanceof Builtin ) return forced;
                    if( forced instanceof Force && forced.termToForce instanceof Builtin ) return forced.termToForce;
                    return new Force( forced );
                case 6:
                    partialUPLC += "(error)";
                    return new ErrorUPLC(
                        "error got from deserialization;",
                        {
                            debruijnLevel: currDbn,
                            byteIndex: currByteIndex(),
                            bitIndex: currPtr
                        });
                case 7:
                    const bn_tag = Number( readNBits(7) );
                    partialUPLC += `(builtin ${builtinTagToString( bn_tag )})`;
                    return new Builtin( bn_tag );

                default: throw new UPLCDeserializaitonError("unknown tag: " + tag + "; partialUPLC == " + partialUPLC );
            }
        }

        function readConst(): UPLCConst
        {
            logState();
            const constTy = readConstTy();
            const val = 
                readConstValueOfType( constTy );

            partialUPLC += `( con ${showConstType( constTy )} ${ showUPLCConstValue( val ) } )`;

            return new UPLCConst(
                constTy,
                val as any
            );
        }

        function readConstTy(): ConstType
        {
            let head = Number( readNBits(1) );

            if( head === 0 ) throw new UPLCDeserializaitonError(
                "empty const type"
            );

            let tyTag: ConstTyTag;
            const type: ConstType = [] as any;
            do {
                tyTag = Number( readNBits(4) );
                head = Number( readNBits(1) );
                if( (tyTag as any) === 7 ) continue;
                type.push( tyTag );
            } while( head !== 0);

            if(!(
                type.length > 0 &&
                isWellFormedConstType( type )
            )) throw new UPLCDeserializaitonError(
                "invalid constant type"
            );
            
            return type;
        }

        function readConstValueOfType( t: ConstType ): ConstValue
        {
            if( constTypeEq( t, constT.int ) )
            {
                return new Integer( readSignedInt() )
            }
            if( constTypeEq( t, constT.byteStr ) )
            {
                readPadding();

                const hexChunks: string[] = [];

                let chunkLen: number = 1; 
                while( chunkLen !== 0 )
                {
                    chunkLen = Number( readNBits(8) );

                    for( let i = 0; i < chunkLen; i++ )
                    {
                        hexChunks.push(
                            readNBits(8).toString(16).padStart(2,'0')
                        );
                    }
                }

                return new ByteString(
                    fromHex(
                        hexChunks.join("")
                    )
                );
            }
            if( constTypeEq( t, constT.str ) )
            {
                return toUtf8( (readConstValueOfType( constT.byteStr ) as ByteString).toBuffer() );
            }
            if( constTypeEq( t, constT.data ) )
            {
                return dataFromCbor(
                    (readConstValueOfType( constT.byteStr ) as ByteString).toBuffer()
                );
            }
            if( constTypeEq( t, constT.bool ) ) return (Number(readNBits(1)) === 1);
            if( constTypeEq( t, constT.unit ) ) return undefined;
            if( t[0] === ConstTyTag.list )
            {
                const tyArg = constListTypeUtils.getTypeArgument( t as any );

                const list: ConstValueList = [];
                
                for(
                    let head = Number( readNBits(1) );
                    head !== 0;
                    head = Number( readNBits(1) )
                )
                {
                    list.push( readConstValueOfType( tyArg ) as never );
                }

                return list;
            }
            if( t[0] === ConstTyTag.pair )
            {
                return new Pair(
                    readConstValueOfType(
                        constPairTypeUtils.getFirstTypeArgument( t as any)
                    ),
                    readConstValueOfType(
                        constPairTypeUtils.getSecondTypeArgument( t as any)
                    )
                );
            };

            throw JsRuntime.makeNotSupposedToHappenError(
                "'readConstValueOfType': no constant type matched"
            );
        }

        return new UPLCProgram(
            new UPLCVersion(readUInt(), readUInt(), readUInt()),
            readTerm()
        );
    }
}
