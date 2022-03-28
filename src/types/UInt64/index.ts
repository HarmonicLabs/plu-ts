import { Buffer } from "buffer";
import UInt64Error from "../../errors/PluTsTypeError/UInt64Error"; 

const wouldOverflowError = new UInt64Error("can't construct an Uint64 with less than 8 bytes")

export default
class UInt64
{
    protected _bytes: Buffer;

    protected static _assert_has8Bytes( buffer: Buffer, offset: number = 0 ): void
    {
        if( buffer.length < offset + 8 ) throw wouldOverflowError;
    }

    private _isNegative: boolean = false;

    /**
     * "dangerously" because this function does not change the byte rappresentation
     * 
     * @param isNegative ```true``` if the UInt64 is meant to represent a negative number ```false``` otherwise
     */
    dangerouslySetNegativeFlag( isNegative: boolean )
    {
        this._isNegative = isNegative;
    }

    get isNegative() : boolean
    {
        return this._isNegative;
    }

    constructor( bytes : Buffer )
    {
        UInt64._assert_has8Bytes( bytes );

        this._bytes = bytes;
    }

    writeToBuffer( buffer: Buffer, offset: number = 0 ): void
    {
        UInt64._assert_has8Bytes( buffer, offset );

        buffer.writeUInt32BE( this._bytes.readUInt32BE(), offset );
        buffer.writeUInt32BE( this._bytes.readUInt32BE( 4 ), offset + 4 );
    }

    negative(): UInt64
    {
        const negBuffer = Buffer.from( this._bytes ); // copy

        const lastByte = this._bytes.readUInt8( this._bytes.length - 1 );

        if( this.isNegative )
        {
            // need to add 1

            if( lastByte === 0xff )
            {
                negBuffer.writeUInt8( 0, negBuffer.length - 1 );
                
                // add 1 to uint8 would overflow
                const lastWord = this._bytes.readUInt32BE( 4 );

                if( lastWord === 0xffffffff )
                {
                    // add 1 to uint32 would overflow
                    negBuffer.writeUInt32BE( 0, 4 );

                    if( this._bytes.readUInt32BE( 0 ) === 0xffffffff )
                    {
                        throw new UInt64Error("negative to positive conversion overflows")
                    }
                    else
                    {
                        negBuffer.writeUInt32BE( negBuffer.readUInt32BE( 0 ) + 1 , 0 );
                    }
                }
                else
                {
                    negBuffer.writeUInt32BE( lastWord + 1, 4 );
                }
            }
            else // no problem, just add one
            {
                negBuffer.writeUInt8( lastByte + 1, negBuffer.length - 1 );
            }
        }
        else // positive UInt64
        {
            // need to subtract 1

            if( lastByte === 0 )
            {
                // add 1 to uint8 would underflow
                const lastWord = this._bytes.readUInt32BE( 4 );

                if( lastWord === 0 )
                {
                    // sub 1 to uint32 would underflow

                    if( this._bytes.readUInt32BE( 0 ) === 0 )
                    {
                        throw new UInt64Error("positive to negative conversion underflows")
                    }
                    else
                    {
                        negBuffer.writeUInt32BE( negBuffer.readUInt32BE( 0 ) - 1 , 0 );
                        negBuffer.writeUInt32BE( 0xffffffff , 4 ); // last word from all 0 to all 1
                    }
                }
                else
                {
                    negBuffer.writeUInt32BE( lastWord - 1, 4 );
                }
            }
            else // no problem, just subtract
            {
                negBuffer.writeUInt8( lastByte - 1, negBuffer.length - 1 );
            }
        }

        const result = new UInt64(
            negBuffer
        );

        result.dangerouslySetNegativeFlag( !this.isNegative );

        return result;
    }

    static fromBytes( bytes: Buffer, offset: number = 0 ): UInt64
    {
        UInt64._assert_has8Bytes( bytes, offset );

        return new UInt64(
            Buffer.from( // copies rather than referencing
                bytes.slice( offset, offset + 8 )
            )
        );
    }

    static fromBigInt( bigInt: bigint )
    {
        let shouldBeNegative = false;

        if( bigInt < BigInt( 0 ) )
        {
            shouldBeNegative = true;
            bigInt = -bigInt;
        }

        let hexBytes = bigInt.toString(16);

        while( hexBytes.length < 16 )
        {
            hexBytes = "0" + hexBytes;
        }

        if( shouldBeNegative )
        {
            return new UInt64(
                Buffer.from( hexBytes , "hex" )
            ).negative();
        }
        else
        {
            return new UInt64(
                Buffer.from( hexBytes , "hex" )
            );
        }

    }

    static is_uint32( uint64: UInt64 ): boolean
    {
        return ( uint64.to_bigint() <= BigInt( 0xffffffff ) )
    }

    is_uint32(): boolean
    {
        return UInt64.is_uint32( this );
    }

    to_bytes(): Buffer
    {
        return this._bytes;
    }
    
    to_bigint(): bigint
    {
        if( !this.isNegative )
        {
            return (
                BigInt( this._bytes.readUInt32BE() ) << BigInt( 32 ) |
                BigInt( this._bytes.readUInt32BE( 4 ) )
            )
        }
        else // negative
        {
            return (-this.negative().to_bigint());
        }
    }

    unsafe_to_number() : number
    {
        return Number( this.to_bigint() );
    }

    to_sumOfUint32_array(): number[]
    {
        let res: number[] = [];

        const maxI32 = 0xffffffff;
        let thisBigInt = this.to_bigint();

        while( thisBigInt > thisBigInt )
        {
            res.push( maxI32 );

            thisBigInt = thisBigInt - BigInt( maxI32 );
        }

        return res;
    }

    to_uint32(): number
    {
        return this._bytes.readUInt32BE( 4 );
    }

    to_int32(): number
    {
        return this.isNegative ? - ( this.to_uint32() + 1) : this.to_uint32();
    }

    to_uint16(): number
    {
        return this._bytes.readUInt32BE( 6 );
    }

    to_int16(): number
    {
        return this.isNegative ? - ( this.to_uint16() + 1) : this.to_uint16();
    }
}