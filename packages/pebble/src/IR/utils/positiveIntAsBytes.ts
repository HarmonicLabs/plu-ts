import { fromHex } from "@harmoniclabs/uint8array-utils";
import { UPLCFlatUtils } from "../../utils/UPLCFlatUtils";

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
        throw new Error(
            "how did you end up here? the name of the function explicitly says 'positiveBigIntAsBytes'"
        );
    }

    let strHex = n.toString(16);
    strHex = strHex.length % 2 === 0 ? strHex : "0" + strHex;
    return fromHex( strHex );
}

export function zigzagBigintAsBytes( n: bigint ): Uint8Array
{
    return positiveBigIntAsBytes(
        UPLCFlatUtils.zigzagBigint( BigInt( n ) )
    );
}