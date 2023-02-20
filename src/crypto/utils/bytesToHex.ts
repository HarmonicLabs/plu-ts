import { byte } from "../types";


// Convert a byte array to a hex string
export function bytesToHex(bytes: byte[] | number[]): string
{
    const len = bytes.length;
    let hex = new Array<string>( len );
    
    let current = 0;

    for (let i = 0; i < len;)
    {
        current = (bytes[i] < 0 ? bytes[i] + 256 : bytes[i]) & 0xff;
        
        hex[i++] = current.toString(16).padStart(2, '0');
    }

    return hex.join("");
}