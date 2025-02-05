import { toHex } from "@harmoniclabs/uint8array-utils";

export const internalVarPrefix = "§"; // invalid char for js identifiers

const internalNamesUsed = new Set<string>();

let getRandomBytes = ( bytes: Uint8Array ) => {
    for ( let i = 0; i < bytes.length; i++ )
        bytes[i] = ((Math.random() * 0x100) >>> 0);
    return bytes;
}
try {
    if(
        typeof globalThis !== "undefined"
        && typeof globalThis.crypto !== "undefined"
        && typeof globalThis.crypto.getRandomValues === "function"
    ) getRandomBytes = globalThis.crypto.getRandomValues.bind( globalThis.crypto );
} catch {}


export function getInternalName( name?: string ): string
{
    if( typeof name !== "string" || name.length === 0 ) name = internalVarPrefix;

    name = name.startsWith( internalVarPrefix ) ? name : internalVarPrefix + name;

    if( internalNamesUsed.has( name ) || name === internalVarPrefix )
    {
        const bytes = new Uint8Array( Math.max( 1, Math.log1p( internalNamesUsed.size ) >>> 0 ) );
        do {
            name = name + toHex( getRandomBytes( bytes ) );
        } while( internalNamesUsed.has( name ) );
    }
    internalNamesUsed.add( name );
    return name;
}

export function isInternalName( name: string ): boolean
{
    return name.startsWith( internalVarPrefix ); // && isIdentifier( name.slice( 1 ) );
}