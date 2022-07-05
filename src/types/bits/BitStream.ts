import { Buffer  } from "buffer";
import BigIntUtils from "../../utils/BigIntUtils";
import BitUtils from "../../utils/BitUtils";
import Debug from "../../utils/Debug";
import JsRuntime from "../../utils/JsRuntime";
import Int32 from "../ints/Int32";
import { forceInByteOffset, InByteOffset } from "./Bit";


export default class BitStream
{
    private _bits: bigint;
    /**
     * a ```BitStream``` could start with a series of zeroes 
     * that would not be tracked otherwhise
     */
    private _nInitialZeroes: number

    get nInitialZeroes(): number
    {
        return this._nInitialZeroes;
    }

    get length(): number
    {
        if( this.isEmpty() ) return 0;

        return this._nInitialZeroes + BitUtils.getNOfUsedBits( this._bits );
    }

    get lengthInBytes(): number
    {
        return BitStream.getMinBytesForLength( this.length );
    }

    static getMinBytesForLength( length: number )
    {
        length = Math.round( Math.abs( length ) );
        
        // even one bit requires a new byte,
        // that's why ceil
        return Math.ceil( length / 8 );
    }

    isEmpty(): boolean
    {
        return this._bits < BigInt( 0 ) && this.nInitialZeroes <= 0;
    }

    isAllZeroes(): boolean
    {
        return this._bits < BigInt( 0 ) && this.nInitialZeroes > 0;
    }

    constructor( bytes?: undefined )
    constructor( bytes: bigint, nInitialZeroes?: number )
    constructor( bytes: Buffer, nZeroesAsEndPadding?: InByteOffset )
    constructor( bytes: bigint | Buffer | undefined , nInitialZeroes: number = 0 )
    {

        // case empty BitStream
        // aka. new BitStream() || new BitStream( undefined )
        if( bytes === undefined )
        {
            this._bits = BigInt( -1 );
            this._nInitialZeroes = 0;
            return;
        }

        // nInitialZeroes has to be an integer
        JsRuntime.assert(
            Math.round( Math.abs( nInitialZeroes ) ) === nInitialZeroes,
            "invalid numebr of nInitialZeroes passed, expected non-negative integer, got: " + nInitialZeroes.toString()
        )

        // construct form bigint
        if( typeof bytes == "bigint" )
        {
            this._nInitialZeroes = nInitialZeroes;
            
            this._bits = BigIntUtils.abs( bytes );
            return;
        }

        // construct form Buffer

        // assert got Buffer instance as input
        JsRuntime.assert(
            Buffer.isBuffer( bytes ),
            "expected a Buffer instance", new Debug.AddInfos({
                got: bytes,
                nativeType: typeof bytes
            })
        );

        Debug.log(" --------------------------------------- constructing from Buffer --------------------------------------- ");

        if( bytes.length === 0 )
        {
            Debug.log( " input was of length 0 " );

            this._bits = BigInt( -1 );
            this._nInitialZeroes = 0;
            return;
        }

        Debug.log( "input is: ", bytes.toString("hex") );

        const nZeroesAsEndPadding = forceInByteOffset( nInitialZeroes );
        Debug.log( `nZeroesAsEndPadding (input): ${nZeroesAsEndPadding}` );


        let firstNonZeroByte = 0;
        let allZeroesBytes = 0; 

        while( allZeroesBytes < bytes.length )
        {
            firstNonZeroByte = bytes.readUint8( allZeroesBytes );

            if( firstNonZeroByte > 0 ) break;

            allZeroesBytes++ 
        }

        Debug.log( `firstNonZeroByte: ${firstNonZeroByte.toString(16)}` );
        Debug.log( `allZeroesBytes: ${allZeroesBytes}` );


        if( allZeroesBytes === bytes.length )
        {
            this._bits = BigInt( -1 );
            this._nInitialZeroes = 8 * allZeroesBytes;
            return;
        }

        this._nInitialZeroes = (8 * allZeroesBytes) + (8 - BitUtils.getNOfUsedBits( BigInt( firstNonZeroByte ) ) );
        
        JsRuntime.assert(
            this._nInitialZeroes >= 0,
            JsRuntime.makeNotSupposedToHappenError(
                "this._nInitialZeroes was setted badly in a BitStream creation using a Buffer as input."
            )
        )

        this._bits = BigIntUtils.fromBuffer( bytes );

        Debug.log( `this._bits: ${this._bits};\nthis._bits.toString(16): ${this._bits.toString(16)}`);

        if( nZeroesAsEndPadding !== 0 )
        {
            this._bits <<= BigInt( nZeroesAsEndPadding );
        }
        
        Debug.log( "final constructed \"this\": ", this );
    }
    
    asBigInt(): bigint
    {
        if( this.isEmpty() ) return BigInt( 0 );

        return this._bits;
    }
    
    /**
     * 
     * @returns {object} 
     *      with a @property {Buffer} buffer containing the buffer
     *      and a @property {InByteOffset} nZeroesAsEndPadding 
     *      containing a number between 7 and 1 both included,
     *      indicating how many of the end bits should be ignored
     */
    toBuffer(): {
        buffer: Buffer,
        nZeroesAsEndPadding: InByteOffset
    }
    {
        Debug.log(" --------------------------------------- toBuffer --------------------------------------- ");

        if( this.isEmpty() ) return {
            buffer: Buffer.from( [] ),
            nZeroesAsEndPadding: 0
        };

        if( this.isAllZeroes() ) return {
            buffer: Buffer.from( "00".repeat( Math.ceil( this.nInitialZeroes / 8 ) ), "hex" ),
            nZeroesAsEndPadding: 
                this._nInitialZeroes % 8 === 0 ? 
                0 : 
                (8 - forceInByteOffset( this._nInitialZeroes ))  as InByteOffset
        }

        Debug.log("buffer was not empty")


        // we don't want to modify our hown bits
        let bits = this._bits;

        Debug.log( `this._bits.toString(16): ${this._bits.toString(16)}`)

        // Array is provided with usefull operation
        // unshift
        // push
        // at the moment doesnt contain any initial zero
        const bitsArr = 
            Array.from<number>( 
                BigIntUtils.toBuffer( bits ) 
            );
        const firstNonZeroByte = bitsArr[0];
        
        Debug.log( `bitsArr (this._bits as Array): ${bitsArr}` );

        Debug.log(`nInitialZeroes: ${this._nInitialZeroes}`)
        // add whole bytes of zeroes at the beginning if needed
        if( this._nInitialZeroes >= 8 )
        {
            bitsArr.unshift(
                ...Array<number>(
                    // number of whole bytes as zeroes
                    Math.floor( this._nInitialZeroes / 8 )
                ).fill( 0 )
            );

            Debug.log( `added ${Math.floor( this._nInitialZeroes / 8 )} bytes of zeroes at the beginning`)
        }

        Debug.log( `bitsArr (this._bits as Array): ${bitsArr}` );

        // remaining zeroes bits
        const nInBytesInitialZeroes : InByteOffset = (this._nInitialZeroes % 8) as InByteOffset;
        Debug.log(`nInByteInitialZeroes: ${nInBytesInitialZeroes}`)

        if( 
            // no bits (whole bytes only)
            nInBytesInitialZeroes === 0  ||
            // nInBytesInitialZeroes already tracked
            nInBytesInitialZeroes === (8 - BitUtils.getNOfUsedBits( BigInt( firstNonZeroByte ) ) )
        )
        {
            return {
                buffer: Buffer.from( bitsArr ),
                nZeroesAsEndPadding: 0
            };
        }

        Debug.log( `(this._nInitialZeroes % 8) is NOT  0: ${nInBytesInitialZeroes}` );

        // shiftr carrying the bits
        let lostBits : number = 0;
        let prevLostBits: number = 0;
        for( 
            let i = 0;
            i < bitsArr.length;
            i++        
        )
        {
            prevLostBits = 
                BitUtils.getNLastBitsInt( 
                    new Int32( bitsArr[i] ),
                    new Int32( nInBytesInitialZeroes )
                ).toNumber();

            const prevByte = bitsArr[i];

            bitsArr[i] = (bitsArr[i] >>> nInBytesInitialZeroes) | lostBits;
            
            Debug.log( 
                `byte shifted from ${prevByte} to ${bitsArr[i]}; 
                in bits: from ${prevByte.toString(2).padStart( 8 ,'0' )} to ${bitsArr[i].toString(2).padStart( 8 ,'0' )}`
            );

            lostBits = prevLostBits
                // prepares lostBits to be used in the biwise or
                << (8 - nInBytesInitialZeroes);
        }

        Debug.log( `bitsArr after shift: ${bitsArr}` );

        // add one final byte containing bits tha would have be lost
        bitsArr.push( lostBits ); 

        return {
            buffer: Buffer.from( bitsArr ),
            nZeroesAsEndPadding: (8 - nInBytesInitialZeroes) as InByteOffset 
        };
    }

    /**
     * @param byOffset number of bits to move to
     * @returns {bigint} lost bits as big integer
     */
    shiftr( byOffset: bigint ): bigint
    {
        const lostBits = BitUtils.getNLastBits( this._bits, byOffset );

        this._bits >>= byOffset;

        return lostBits;
    }

    shiftl( byOffset: bigint )
    {
        this._bits <<= byOffset;
    }

    append( other: BitStream ): void
    {
        if( other.isEmpty() )
        {
            return;
        }

        if( this.isEmpty() )
        {
            this._bits = other._bits;
            this._nInitialZeroes = other.nInitialZeroes;
            return;
        }

        if( this.isAllZeroes() )
        {
            this._bits = other._bits;
            this._nInitialZeroes = this._nInitialZeroes + other.nInitialZeroes; 
            return;
        }

        
        // make some space
        this._bits = this._bits << BigInt( other.length );

        // other.length keeps track also of possible initial zeroes
        // so those have been added when shifting
        this._bits = this._bits | other._bits;

    }

    /*
    static concat( a: BitStream, b: BitStream ): BitStream
    {
        let bits = a.asBigInt();
        bits = bits << BigInt( b.length );
        bits = bits | b.asBigInt();
        return new BitStream(bits, a._nInitialZeroes)
    }
    //*/
}