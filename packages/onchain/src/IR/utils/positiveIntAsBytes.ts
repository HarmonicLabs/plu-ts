import { fromHex } from "@harmoniclabs/uint8array-utils";

/**
 * writes the number in a new `Uint8Array` Big Endian
 */
export function positiveIntAsBytes( n: number | bigint ): Uint8Array
{
    if( typeof n === "bigint" )
    {
        return positiveBigIntAsBytes( n );
    }
    
    if( !Number.isSafeInteger( n ) || n < 0 )
    {
        console.log( n );
        console.trace(); // some help
        throw new Error(
            "how did you end up here? the name of the function explicitly says 'positiveIntAsBytes'"
        );
    }

    let max = 0x100;
    let nBytes = 1;
    while( max <= n )
    {
        nBytes++;
        max = max << 8;
    }
    const result = new Uint8Array( nBytes );
    // just reuse some variable
    while( n > 0 )
    {
        result[ --nBytes ] = n & 0xff;
        n = n >>> 8;
    }
    return result;
}

export function positiveBigIntAsBytes( n: bigint ): Uint8Array
{
    if( n < 0 || typeof n !== "bigint" )
    {
        console.log( n );
        console.trace();  // some help
        throw new Error(
            "how did you end up here? the name of the function explicitly says 'positiveBigIntAsBytes'"
        );
    }

    let strHex = n.toString(16);
    strHex = strHex.length % 2 === 0 ? strHex : "0" + strHex;
    return fromHex( strHex );
}