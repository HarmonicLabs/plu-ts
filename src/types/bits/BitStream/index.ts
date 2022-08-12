import { Buffer } from "buffer";
import BigIntUtils from "../../../utils/BigIntUtils";
import BitUtils from "../../../utils/BitUtils";
import Debug from "../../../utils/Debug";
import JsRuntime from "../../../utils/JsRuntime";
import Cloneable from "../../interfaces/Cloneable";
import Indexable from "../../interfaces/Indexable";
import Int32 from "../../ints/Int32";
import BinaryString from "../BinaryString";
import Bit, { forceInByteOffset, InByteOffset } from "../Bit";
import BitStreamIterator from "./BitStreamIterator";

export default class BitStream
    implements Cloneable<BitStream>, Indexable<Bit>
{
    static isStrictInstance( value: any ): boolean
    {
        return Object.getPrototypeOf( value ) === BitStream.prototype;
    }

    private _bits: bigint;

    /**
     * **IMPORTANT**
     * 
     * this property returns the raw bigint stored in the instance
     * 
     * this means that if the instance represents an empty ```BitStream``` ,
     * or one composed by an undefinite series of zeroes, you'll likely get an different result than the expected one
     * 
     * for a more appropriate result you should use the ```asBigInt``` method
     * 
     * example:
     * ```ts
     * const myBitStream = new BitStream();
     * 
     * myBitStream.bits // -> -1n
     * myBitStream.asBigInt().bigint // -> 0n
     * 
     * ```
     * 
     */
    get bits(): bigint
    {
        return this._bits;
    }

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

    isEmpty(): boolean
    {
        return this._bits < BigInt( 0 ) && this.nInitialZeroes <= 0;
    }

    isAllZeroes(): boolean
    {
        return this._bits <= BigInt( 0 ) && this.nInitialZeroes >= 0;
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

            // throws in debug only
            if( bytes < BigInt( 0 ) )
            {
                Debug.throw(
                    "cannot construct a BitStream using negative numbers"
                );
            }
            
            // silently adapts the input if negative in produciton
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

        if( bytes.length === 0 )
        {
            this._bits = BigInt( -1 );
            this._nInitialZeroes = 0;
            return;
        }

        const nZeroesAsEndPadding = forceInByteOffset( nInitialZeroes );

        let firstNonZeroByte = 0;
        let allZeroesBytes = 0; 

        while( allZeroesBytes < bytes.length )
        {
            firstNonZeroByte = bytes.readUint8( allZeroesBytes );

            if( firstNonZeroByte > 0 ) break;

            allZeroesBytes++ 
        }

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

        if( nZeroesAsEndPadding !== 0 )
        {
            this._bits = this.bits << BigInt( nZeroesAsEndPadding );
        }
    }

    static fromBinStr( binStr : BinaryString | string ): BitStream
    {
        if( typeof binStr === "string" )
        {
            // asserts it is a binary string
            binStr = new BinaryString( binStr );
        };

        JsRuntime.assert(
            binStr instanceof BinaryString,
            "expected an instance of the 'BinsryString' class; got: " + binStr.toString()
        );

        const rawBinStr = binStr.asString;
        const firstOneAt = rawBinStr.indexOf('1');

        if( firstOneAt < 0 ) // case all zeroes
        {
            return new BitStream(
                BigInt( 0 ),
                rawBinStr.length
            )
        }

        return new BitStream(
            BigInt( `0b${rawBinStr.slice(firstOneAt)}`),
            firstOneAt
        )
    }

    toBinStr(): BinaryString
    {
        const { bigint, nInitialZeroes } = this.asBigInt();
        return new BinaryString(
            "0".repeat( nInitialZeroes ) + bigint.toString(2)
        );
    }

    static getMinBytesForLength( length: number )
    {
        length = Math.round( Math.abs( length ) );
        
        // even one bit requires a new byte,
        // that's why ceil
        return Math.ceil( length / 8 );
    }

    getNBitsMissingToByte() : InByteOffset
    {
        const lengthMod8 = this.length % 8;
        if(lengthMod8 === 0) return 0; // would have returned 8 (8 - 0) otherwise
        return (8 - lengthMod8) as InByteOffset;
    }

    /**
     * allows to use ```BitStream```s in ```for..of``` loops
     * 
     * e.g.:
     * ```ts
     * for( let bit of bitStream )
     * {
     *    // ```bit``` si an object of type ```Bit```
     * }
     * ```
     */
    [Symbol.iterator] = () => new BitStreamIterator( this );

    at( index: number ): Bit
    {
        if( index >= this.length || index < 0 ) throw RangeError("cannot access bit at index " + index.toString() )
    
        if( index < this.nInitialZeroes ) return new Bit( 0 );

        index = Math.round( index );

        Debug.ignore.log(
            `this.bits: ${this.bits.toString(2).padStart(8, '0' )}`,
            `\nmask:      ${BigInt( 1 << (this.length - index - 1) ).toString(2).padStart(8, '0' )}`,
            `\nresult:    ${(this.bits & BigInt( 1 << (this.length - index - 1) ) ).toString(2).padStart(8, '0' )}`,
        );

        return new Bit(
            Boolean(
                this.bits & BigInt( 1 << (this.length - index - 1) )
            )
        )
        
    }
    
    /**
     * 
     * @returns {object} 
     *      with a @property {Buffer} bigint containing the bigint
     *      and a @property {InByteOffset} nInitialZeroes 
     *      containing a non-negative integer
     *      indicating how many (non-tracked in the bigint) zeroes are present in the ```BitStream```
     */
    asBigInt(): {
        bigint: bigint,
        nInitialZeroes: number
    }
    {
        if( this.isEmpty() ) return {
            bigint: BigInt( 0 ),
            nInitialZeroes: 0
        }

        if( this.isAllZeroes() ) return {
            bigint: BigInt( 0 ),
            nInitialZeroes: this.nInitialZeroes
        }

        return {
            bigint: this.bits,
            nInitialZeroes: this.nInitialZeroes
        }
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
        if( this.isEmpty() ) return {
            buffer: Buffer.from( [] ),
            nZeroesAsEndPadding: 0
        };

        if( this.isAllZeroes() ) return {
            buffer: this.nInitialZeroes <= 0 ? Buffer.from( [] ) : Buffer.from( "00".repeat( Math.ceil( this.nInitialZeroes / 8 ) ), "hex" ),
            nZeroesAsEndPadding: 
                this._nInitialZeroes % 8 === 0 ? 
                0 : 
                (8 - forceInByteOffset( this._nInitialZeroes ))  as InByteOffset
        }

        // we don't want to modify our own bits
        let bits = this.bits;

        // Array is provided with usefull operation
        // unshift
        // push
        // at the moment doesnt contain any initial zero
        const bitsArr = 
            Array.from<number>( 
                BigIntUtils.toBuffer( bits ) 
            );
        const firstNonZeroByte = bitsArr[0];

        // add whole bytes of zeroes at the beginning if needed
        if( this.nInitialZeroes >= 8 )
        {
            bitsArr.unshift(
                ...Array<number>(
                    // number of whole bytes as zeroes
                    Math.floor( this.nInitialZeroes / 8 )
                ).fill( 0 )
            );
        }

        if( firstNonZeroByte === undefined )
        {
            console.error( firstNonZeroByte )
            console.log("toBuffer called on: ", this);
            console.log(
                `this.isEmpty(): ${this.isEmpty()}`,
                `this.isAllZeroes(): ${this.isAllZeroes()}`,
            );
        }

        // remaining zeroes bits
        const supposedInByteInitialZeroes : InByteOffset = (this.nInitialZeroes % 8) as InByteOffset;
        const effectiveInByteInitialZeroes: InByteOffset = ( 8 - BitUtils.getNOfUsedBits( BigInt( firstNonZeroByte ?? 0 ) ) ) as InByteOffset ;

        JsRuntime.assert(
            (effectiveInByteInitialZeroes >= 0 && effectiveInByteInitialZeroes <= 7) &&
            Math.round( effectiveInByteInitialZeroes ) == effectiveInByteInitialZeroes,
            JsRuntime.makeNotSupposedToHappenError(
                "unexpected numebr of effectiveInByteInitialZeroes; should be 'InByteOffset'; got: " + effectiveInByteInitialZeroes.toString()
            )
        );

        if( 
            // no bits (whole bytes only)
            // supposedInByteInitialZeroes === 0  ||
            // supposedInByteInitialZeroes already tracked
            supposedInByteInitialZeroes === effectiveInByteInitialZeroes
        )
        {
            return {
                buffer: Buffer.from( bitsArr ),
                nZeroesAsEndPadding: 0
            };
        }

        /*
        
        example:
        if( 5 < 7 ) means
        the first (non-zero) byte is like `0b0000_0111`
        whereas it should be              `0b0000_0001`

        if that's the case we shift right by 2 ( 7 - 5 )
        */
        if( effectiveInByteInitialZeroes < supposedInByteInitialZeroes )
        {
            // shiftr carrying the bits
            const shiftBy = supposedInByteInitialZeroes - effectiveInByteInitialZeroes;

            let lostBits : number = 0
            let prevLostBits: number = 0;
            for( 
                let i = 
                    //skip the bytes manually setted to zero before (line 245)
                    Math.floor( this.nInitialZeroes / 8 );
                i < bitsArr.length;
                i++        
            )
            {
                prevLostBits = 
                    BitUtils.getNLastBitsInt( 
                        new Int32( bitsArr[i] ),
                        new Int32( shiftBy )
                    ).toNumber();

                bitsArr[i] = (bitsArr[i] >>> shiftBy) | lostBits;
                
                lostBits = prevLostBits
                    // prepares lostBits to be used in the biwise or
                    << (8 - shiftBy);
            }

            // add one final byte containing bits tha would have be lost
            bitsArr.push( lostBits ); 

            return {
                buffer: Buffer.from( bitsArr ),
                nZeroesAsEndPadding: (8 - shiftBy) as InByteOffset 
            };
        }

        /* 
        otherwhise it means
        effectiveInByteInitialZeroes > supposedInByteInitialZeroes

        so the situation is like:

        first (non-zero) byte `0b0000_0001`
        whereas it should be  `0b0000_0111`

        so we are supposed to shif left by "effectiveInByteInitialZeroes - supposedInByteInitialZeroes" (in this case 2)
        */

        const shiftBy = effectiveInByteInitialZeroes - supposedInByteInitialZeroes;

        /**
         * this is quick and dirty, we are basically re-doin what did before
         * @fixme should be moved above to remove code duplication
         */
        const shiftedlBitsArr = 
            Array.from<number>(
                // let bigint do the dirty work
                BigIntUtils.toBuffer( bits << BigInt( shiftBy ) ) 
            );
        
        // add whole bytes of zeroes at the beginning if needed
        if( this.nInitialZeroes >= 8 )
        {
            shiftedlBitsArr.unshift(
                ...Array<number>(
                    // number of whole bytes as zeroes
                    Math.floor( this.nInitialZeroes / 8 )
                ).fill( 0 )
            );
        }

        return {
            buffer: Buffer.from( shiftedlBitsArr ),
            nZeroesAsEndPadding: shiftBy as InByteOffset 
        };

    }

    /**
     * @param byOffset number of bits to move to
     * @returns {bigint} lost bits as big integer
     */
    shiftr( byOffset: bigint ): bigint
    {
        const lostBits = BitUtils.getNLastBits( this._bits, byOffset );

        this._bits = this.bits >> byOffset;

        return lostBits;
    }

    shiftl( byOffset: bigint )
    {
        this._bits = this.bits << byOffset;
    }

    append( other: Readonly<BitStream> ): void
    {
        if( other.isEmpty() )
        {
            return;
        }

        if( this.isEmpty() )
        {
            this._bits = other.bits;
            this._nInitialZeroes = other.nInitialZeroes;
            return;
        }

        if( this.isAllZeroes() )
        {
            this._bits = other.bits;
            this._nInitialZeroes = this._nInitialZeroes + other.nInitialZeroes; 
            return;
        }

        if( other.isAllZeroes() )
        {
            this._bits = this._bits << BigInt( other.nInitialZeroes );
            return;
        }
        
        // make some space
        this._bits = this.bits << BigInt( other.length );

        // other.length keeps track also of possible initial zeroes
        // so those have been added when shifting
        this._bits = this.bits | other.bits;

    }

    clone(): BitStream
    {
        if( this.isEmpty() ) return new BitStream();

        return new BitStream(
            this.bits,
            this.nInitialZeroes
        )
    }

    static concat( a: BitStream, b: BitStream ): BitStream
    {
        const bitStream = a.clone();

        // .append's argument is readonly
        bitStream.append( b );

        return bitStream;
    }
    

    // -------------------------------------------------------------------------------------------------------------------------- //
    // ------------------------------------------------------- Operations ------------------------------------------------------- //
    // -------------------------------------------------------------------------------------------------------------------------- //

    static eq( a: BitStream, b: BitStream ): boolean
    {
        // if same object (same reference) return true
        // Ω(1) // Omega(1)
        if( a === b ) return true;

        return (
            a.nInitialZeroes === b.nInitialZeroes &&
            a.bits === b.bits
        );
    }

}
