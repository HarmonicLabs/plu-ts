const hexChars = Object.freeze(Array.from("0123456789abcdef"));

export function isHex( str: string ): boolean 
{
    if(!( typeof str === "string" ))  return false;

    return Array.from(str).every( ch => hexChars.includes( ch ) );
}