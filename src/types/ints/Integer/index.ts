import BasePlutsError from "../../../errors/BasePlutsError";
import BigIntUtils from "../../../utils/BigIntUtils";
import Cloneable from "../../interfaces/Cloneable";

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
    implements Cloneable<Integer>
{
    get [Symbol.toStringTag](): string
    {
        return "Integer";
    }

    static isStrictInstance( any: any ): boolean
    {
        return Object.getPrototypeOf( any ) === Integer.prototype
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

    clone(): Integer
    {
        return new Integer( this._bigint );
    }
}

export class UInteger extends Integer
    implements Cloneable<UInteger>
{
    get [Symbol.toStringTag](): "UInteger"
    {
        return "UInteger";
    }

    static isStrictInstance(any: any): boolean
    {
        return Object.getPrototypeOf( any ) === UInteger.prototype;    
    }
    
    constructor( bigint: bigint | number )
    {
        if( !UInteger.isUInteger( bigint ) )
        {
            throw new BasePlutsError("input to the 'Integer' class was not an **unsigned** integer; got: " + bigint.toString())
        }

        if( typeof bigint === "number" )
        {
            bigint = BigInt( bigint );
        }

        // isUInteger at the beginning of the constructor guarantees the number is non-negative
        super( bigint );
    }

    toSigned(): Integer
    {
        return new Integer( this.asBigInt );
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

    clone(): UInteger
    {
        return new UInteger( this._bigint );
    }
}

export type CanBeUInteger
    = UInteger
    | Integer
    | number;

export function forceUInteger( toForce: CanBeUInteger ): UInteger
{
    if( toForce instanceof UInteger && UInteger.isStrictInstance( toForce ) )
    {
        return toForce;
    }
    if( toForce instanceof Integer )
    {
        // makes sure is integer strict instance
        toForce = toForce.toSigned();

        if( toForce.asBigInt < BigInt( 0 ) )
        {
            throw new BasePlutsError( "trying to convert an integer to an unsigned Integer, the integer was negative" );
        }
        
        return new UInteger( toForce.asBigInt );
    }

    if( toForce < 0 )
    {
        throw new BasePlutsError( "trying to convert an integer to an unsigned Integer, the number was negative" );
    }

    return new UInteger( Math.round( toForce ) );
} 
