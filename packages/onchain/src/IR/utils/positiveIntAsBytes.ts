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

    let str = n.toString(16);
    str = str.length % 2 === 0 ? str : "0" + str;
    return fromHex( str );
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