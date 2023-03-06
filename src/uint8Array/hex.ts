import { isUint8Array } from "./isUint8Array";

export function toHex( buff: Uint8Array ): string
{
    if( !isUint8Array( buff ) )
    throw new TypeError('toHex expects an `Uint8Array`;');

    const strArr: string[] = new Array( buff.length );
    buff.forEach( (b,i) => strArr[i] = b.toString(16).padStart(2,'0') );
    return strArr.join('')
}

const hexChars = Object.freeze(
    Array.from(
        "0123456789abcdef"
    )
)

function isLowerCaseHex( str: string ): boolean
{
    return Array.from( str ).every( ch => hexChars.includes( ch ) )
}

export function fromHex( str: string ): Uint8Array
{
    if( typeof str !== "string" )
    throw new TypeError('fromHex expects an hexadecimal string;');

    str = str.toLowerCase();
    str = str.length % 2 === 0 ? str : '0'+ str;
    const len = str.length / 2;
    const arr = new Array<number>( len );

    for( let i = 0; i < len; i++ )
    {
        const i2 = i * 2;
        const byte = str.substring( i2, i2 + 2 );

        if( !isLowerCaseHex(byte) )
        throw new TypeError('fromHex expects an hexadecimal string; input was: ' + str )

        arr[i] = parseInt( "0x" + byte )
    }
    return new Uint8Array( arr );
}