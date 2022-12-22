import BasePlutsError from "../../errors/BasePlutsError";
import BitStream from "../../types/bits/BitStream";
import { buffToUint5Arr } from "../types";

export const rfc4648_ALPHABET = Object.freeze([
    'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z', '2', '3',
    '4', '5', '6', '7'
] as const);

export const BECH32_BASE32_ALPHABET = Object.freeze([
    'q', 'p', 'z', 'r', 'y', '9', 'x',
    '8', 'g', 'f', '2', 't', 'v', 'd',
    'w', '0', 's', '3', 'j', 'n', '5',
    '4', 'k', 'h', 'c', 'e', '6', 'm',
    'u', 'a', '7', 'l'
] as const);

export function encodeBase32rfc4648(bytes: Buffer)
{
    return buffToUint5Arr(bytes).map(c => rfc4648_ALPHABET[c]).join("");
}

function decodeBase32( base32Str: string, alpabeth: typeof BECH32_BASE32_ALPHABET | typeof rfc4648_ALPHABET )
{
    if( !Array.from( base32Str ).every( ch => alpabeth.includes( ch as any ) ) )
    throw new BasePlutsError(
        "can't decode base32 a string that is not in base32 (rfc 4648); string was: " + base32Str
    );

    const len = base32Str.length;

    let bits: string = '';

    for (let i = 0; i < len - 1; i++)
    {    
        const num = alpabeth.indexOf(
            base32Str[i].toLowerCase() as any
        );

        bits += num.toString(2).padStart( 5, '0' );
    }
    // last, make sure we align to byte
    let nCut = len*5 - 8*Math.floor(len*5/8);

    const num = alpabeth.indexOf(
        base32Str[len - 1].toLowerCase() as any
    );
    let lastbits = num.toString(2).padStart( 5, '0' );

    bits += lastbits.slice(0, 5 - nCut);

    return BitStream.fromBinStr( bits ).toBuffer().buffer;
}

export function decodeBase32rfc4648( base32Str: string )
{
    return decodeBase32( base32Str, rfc4648_ALPHABET );
}

export function decodeBase32Bech32( base32Str: string )
{
    return decodeBase32( base32Str, BECH32_BASE32_ALPHABET );
}