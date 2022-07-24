import BasePlutsError from "../../../errors/BasePlutsError";
import UPLCSerializable from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import BigIntUtils from "../../../utils/BigIntUtils";
import BitUtils from "../../../utils/BitUtils";
import BufferUtils from "../../../utils/BufferUtils"
import JsRuntime from "../../../utils/JsRuntime";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";
import BinaryString from "../../bits/BinaryString";
import BitStream from "../../bits/BitStream";

/**
 * javascript already has a builtin support for arbitrary length integers,
 * 
 * this is achieved thanks to ```bigint```,
 * this is not actually true since ```10n << 10000000000n``` throws
 * ```js
 * Uncaught RangeError: Maximum BigInt size exceeded
 * ```
 * but this should not be a problem since probably we'll never need a number that takes 125MB
 * 
 * if you don't belive me on the memory required try running
 * ```js
 * (10n << 1000000000n).toString(16)
 * ```
 * which still doesn't throws and keep in mind that every two chars that's a byte
 * 
 * that is why internally ```Integer``` is represented by a ```bigint```
 * 
 * useful documentaion:
 * - javascript for the impatient programmer: https://exploringjs.com/impatient-js/ch_bigints.html
 * 
 */
export default class Integer
    implements UPLCSerializable
{
    get [Symbol.toStringTag](): string
    {
        return "Integer";
    }

    static isStrictInstance( any: any ): boolean
    {
        return any.__proto__ === Integer.prototype
    }

    protected _bigint : bigint;

    get asBigInt(): bigint
    {
        return this._bigint;
    }

    constructor( bigint: bigint | number )
    {
        if( typeof bigint === "number" )
        {
            if( !Integer.isInteger( bigint ) )
            {
                throw new BasePlutsError("input to the 'Integer' class was not an integer; got: " + bigint.toString())
            }

            bigint = BigInt( bigint );
        }

        this._bigint = bigint;
    }

    toSigned(): Integer
    {
        return new Integer( this.asBigInt );
    }

    toZigZag(): ZigZagInteger
    {
        return ZigZagInteger.fromInteger( this );
    }

    static fromZigZag( zigzagged: ZigZagInteger ): Integer
    {
        return zigzagged.toInteger();
    }

    toUPLCBitStream(): BitStream
    {
        return this.toZigZag().toUPLCBitStream();
    }

    static isInteger( int: number ): boolean
    {
        return Math.round( int ) === int;
    }

    static fromNumber( int: number ): Integer
    {
        return new Integer( Math.round(int) )
    }

    static formBigInt( int: bigint ): Integer
    {
        return new Integer( int );
    }
}

export class ZigZagInteger
    implements UPLCSerializable
{
    get [Symbol.toStringTag](): "ZigZagInteger"
    {
        return "ZigZagInteger";
    }

    static isStrictInstance( any: any ): boolean
    {
        return any.__proto__ === ZigZagInteger.prototype
    }

    private _zigzagged: bigint;

    get asBigInt(): bigint
    {
        return this._zigzagged;
    }

    private constructor( integer : Integer )
    {
        if(!( integer instanceof Integer ))
        {
            throw new BasePlutsError("expected instance of 'Integer' class to construct a 'ZigZagInteger';");
        }

        const bigint = integer.asBigInt ;

        this._zigzagged = 
            (
                bigint >> 
                    (
                        BigInt( 
                            BitUtils.getNOfUsedBits( bigint ) 
                        )
                    )
            ) ^ // XOR
            ( bigint << BigInt( 1 ) );
    }

    static fromNumber( num: number ): ZigZagInteger
    {
        return ZigZagInteger.fromInteger(
            new Integer( num )
        )
    }

    static fromInteger( integer: Integer )
    {
        // the constructor takes care of the encoding
        return new ZigZagInteger( integer );
    }

    static fromAlreadyZigZagged( zigzagged: bigint ): ZigZagInteger
    {
        JsRuntime.assert(
            typeof zigzagged == "bigint" && zigzagged >= BigInt(0),
            "already zigzagged integer cannot be negative; input:" + zigzagged.toString()
        )

        const res = ZigZagInteger.fromNumber( 0 );
        res._zigzagged = zigzagged;

        return res;
    }
    
    toInteger(): Integer
    {
        const bigint = this.asBigInt;

        // decode
        return new Integer(
            (
                (bigint >> BigInt(1))
            )^ 
            -( bigint & BigInt(1) )
        )
    }

    toUPLCBitStream(): BitStream
    {
       return UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream( this.asBigInt );
    }
}

export class UInteger extends Integer
    implements UPLCSerializable
{
    get [Symbol.toStringTag](): "UInteger"
    {
        return "UInteger";
    }

    static isStrictInstance(any: any): boolean
    {
        return any.__proto__ === UInteger.prototype;    
    }
    
    constructor( bigint: bigint | number )
    {
        if( typeof bigint === "number" )
        {
            if( !UInteger.isUInteger( bigint ) )
            {
                throw new BasePlutsError("input to the 'Integer' class was not an **unsigned** integer; got: " + bigint.toString())
            }

            bigint = BigInt( bigint );
        }

        super( BigIntUtils.abs( bigint ) );
    }

    toSigned(): Integer
    {
        return new Integer( this.asBigInt );
    }

    toZigZag(): ZigZagInteger
    {
        return ZigZagInteger.fromInteger( new Integer( this.asBigInt ) );
    }

    toUPLCBitStream(): BitStream
    {
       return UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream( this.asBigInt );
    }

    static isUInteger( int: number | bigint ): boolean
    {
        if( typeof int === "number")
            return Math.round( Math.abs( int ) ) === int;

        return BigIntUtils.abs( int ) === int;
    }

    static fromNumber( int: number ): UInteger
    {
        return new UInteger( Math.round( Math.abs( int ) ) )
    }

    static formBigInt( int: bigint ): Integer
    {
        return new UInteger( BigIntUtils.abs( int ) );
    }
}