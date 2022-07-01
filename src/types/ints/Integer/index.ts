import BufferUtils from "../../../utils/BufferUtils"

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
{
    private _bigint : bigint ;

    constructor( bigint: bigint | number )
    {
        this._bigint = typeof bigint == "bigint" ? bigint : BigInt( bigint );
    }

    /* FIXME add bytes interoperability
    toBytes(): Uint8Array
    {

    }

    static fromBytes( bytes: Buffer ): Integer
    {
        return new Integer( bytes );
    }
    */

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