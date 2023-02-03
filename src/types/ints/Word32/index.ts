import Debug from "../../../utils/Debug";
import JsRuntime from "../../../utils/JsRuntime";
import { Cloneable } from "../../interfaces/Cloneable";
import { Int32 } from "../Int32";

export type InWord32Offset 
    = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 31;

export function forceInWord32Offset( offset: number ): InWord32Offset
{
    return (Math.round( Math.abs( offset ) ) % 32) as InWord32Offset;
}

/**
 * like ```Int32``` but whit byte-oriented methods 
 * 
 * internally a javascript **signed** int32
 * 
 */
export class Word32
    implements Cloneable<Word32>
{
    private _word : number;

    /**
     * to check if it is safe to construct an ```Int32``` instance using a given numebr use
     * ```ts
     * Int32.isInt32( number );
     * ```
     * 
     * @param {number} int a number that will be made absolute, rounded and truncated if greather than (2^31 - 1)
     */
    constructor( int: Readonly<number> )
    {
        JsRuntime.assert(
            Int32.isInt32( int ),
            "trying to construct a Word32 instance using " + int.toString() + " as input. keep in mind that Word32 is a **signed** integer internally",
            new Debug.AddInfos({
                input: int,
                asInt32: Int32.toInt32Num( int ),
                inputBinary: int.toString(2),
                asInt32Binary: Int32.toInt32Num( int ).toString(2)
            })
        )

        this._word = int | 0;
    }

    /**
     * if the provided buffer has more than 4 bytes only the first 4 will be considered
     */
    static fromBuffer( bytes: Buffer ): Word32
    {

        if( bytes.length === 0)
        {
            return new Word32( 0 | 0 );
        }
        else if( bytes.length === 1 )
        {
            return new Word32( bytes.readUInt8() | 0 );
        }
        else if( bytes.length === 2 )
        {
            return new Word32( bytes.readUint16BE() | 0 );
        }
        else if( bytes.length === 3 )
        {
            return new Word32( 
                ( 
                    bytes.readUint16BE() 
                    << 8 // make space for the next byte 
                ) 
                | bytes.readUInt8( 2 ) );
        }

        if( bytes.length > 4 )
        {
            Debug.warn(
                "constructing a Word32 instance using a buffer of length greather than 4, taking only the first 4 bytes"
            );
        }
        return new Word32( bytes.readUint32BE() | 0 );

    }

    mapToBytesContainingOnes(): [ boolean, boolean, boolean, boolean ]
    {
        return [
            (this._word & 0b11111111_00000000_00000000_00000000) !== 0,
            (this._word & 0b00000000_11111111_00000000_00000000) !== 0,
            (this._word & 0b00000000_00000000_11111111_00000000) !== 0,
            (this._word & 0b00000000_00000000_00000000_11111111) !== 0
        ];
    }

    /**
     * **ATTENTION**
     * 
     * the returned value should be interpreted alongside the input given
     * 
     * example ```shiftrAndGetLostBits( 10 )``` on a word like
     * 
     * ```js
     *    01011001_00111011_01011000_00000000
     * //                        ^ 
     * //                       this will be the last bit keept
     * ```
     * will return ```0``` because the last 10 bits where 0
     * 
     * this doesn't mean the shift didn't happened
     * 
     * and the word will then be
     * ```js
     *    00000000_00010110_01001110_11010110
     * //            ^
     * //            previous first bit
     * ```
     * 
     * @param shiftBy n bits to shift to the rigth
     * @returns number corresponding to the bits outside the word
     */
    shiftrAndGetLostBits( shiftBy: InWord32Offset ): number
    {
        if( shiftBy === 0 ) return 0;

        let lostBitsMask = 0b1;
        
        for( let i = 1; i < shiftBy; i++ )
        {
            lostBitsMask = (lostBitsMask << 1) | 0b1;
        }

        const lostBits = this._word & lostBitsMask;
        
        this._word = this._word >> shiftBy;

        return lostBits;
    }

    /**
     * **ATTENTION**
     * 
     * the returned value should be interpreted alongside the input given
     * 
     * example ```shiftlAndGetLostBits( 10 )``` on a word like
     * ```js
     *    00000000_00010110_01001110_11010110
     * //            ^
     * //            this will be the last bit keept
     * ```
     * 
     * will return ```0``` because the first 10 bits where 0
     * 
     * this doesn't mean the shift didn't happened
     * 
     * and the word will then be
     * 
     * ```js
     *    01011001_00111011_01011000_00000000
     * //                        ^ 
     * //                       previous last bit
     * ```
     * 
     * @param shiftBy n bits to shift to the left
     * @returns number corresponding to the bits outside the word
     */
    shiftlAndGetLostBits( shiftBy: InWord32Offset ): number
    {
        if( shiftBy === 0 ) return 0;

        const firstBitOne = 0b10000000_00000000_00000000_00000000 | 0; // -2147483648 | 0
        let lostBitsMask = firstBitOne;
        let lostBitsMaskLength = 1;
        
        for( ; lostBitsMaskLength < shiftBy; lostBitsMaskLength++ )
        {
            lostBitsMask = (lostBitsMask >> 1) | firstBitOne;
        }

        const lostBits = (this._word & lostBitsMask) >> (32 - lostBitsMaskLength);
        
        this._word = this._word << shiftBy;

        return lostBits;
    }

    toNumber(): number
    {
        return this._word;
    }

    toInt32(): Int32
    {
        return new Int32( this._word );
    }

    byteAt( index: 0 | 1 | 2 | 3 ): number
    {
        // rounds
        index = Math.round( index ) as (0 | 1 | 2 | 3);
        // ensure valid index
        index = index < 0 ? 0 : ( index > 3 ? 3 : index );

        /*
        byteAt(3) -> (this._word & 0b11111111_00000000_00000000_00000000) >> ( 8 * 3 )
        byteAt(2) -> (this._word & 0b00000000_11111111_00000000_00000000) >> ( 8 * 2 )
        byteAt(1) -> (this._word & 0b00000000_00000000_11111111_00000000) >> ( 8 * 1 )
        byteAt(0) -> (this._word & 0b00000000_00000000_00000000_11111111)
        */
        return ( 
            (
                (
                    this._word & 
                    ( // select bits
                        0b1111_1111 << 
                        ( 8 * index ) 
                    )
                )
                >> // bring them to the first byte
                (
                    8 * 
                    (3 - index) 
                )
            ) 
        );
    }

    asUInt8Array(): Uint8Array
    {
        return new Uint8Array([
            (this._word & 0b11111111_00000000_00000000_00000000) >> ( 8 * 3 ),
            (this._word & 0b00000000_11111111_00000000_00000000) >> ( 8 * 2 ),
            (this._word & 0b00000000_00000000_11111111_00000000) >> ( 8 * 1 ),
            (this._word & 0b00000000_00000000_00000000_11111111),
        ]) 
    }

    asBuffer(): Buffer
    {
        return Buffer.from( this.asUInt8Array() );
    }

    clone(): Word32
    {
        return new Word32( this._word );
    }


    static bitwiseAnd( a: Word32, b: Word32 ): Word32
    {
        return new Word32( a._word & b._word );
    }

    bitwiseAnd( other: Word32 ): void
    bitwiseAnd( other: number ): void
    bitwiseAnd( other: Word32 | number ): void
    {
        if( typeof other === "number" )
        {
            this._word = this._word & ( other | 0 );
        }
        else
        {
            this._word = Word32.bitwiseAnd( this, other ).toNumber() | 0 ;
        }
    }

    static bitwiseOr( a: Word32 , b: Word32 ): Word32
    {
        return new Word32( a._word | b._word );
    }

    bitwiseOr( other: Word32 ): void
    bitwiseOr( other: number ): void
    bitwiseOr( other: Word32 | number ): void
    {
        if( typeof other === "number" )
        {
            this._word = this._word | ( other | 0 );
        }
        else
        {
            this._word = Word32.bitwiseOr( this, other ).toNumber() | 0 ;
        }
    }
}