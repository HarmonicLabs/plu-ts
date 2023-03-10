import { byte } from "../types";

// Convert a hex string to a byte array
export function hexToBytes(hex: string): byte[]
{
    if( (hex.length % 2) !== 0 ) hex = '0'+ hex;

    const len = hex.length;
    const bytes = new Array<number>( len / 2 );

    for (let c = 0; c < hex.length; )
        bytes[ c / 2 ] = parseInt( hex.substring(c, c += 2), 16 );
    
    return bytes as any;
}