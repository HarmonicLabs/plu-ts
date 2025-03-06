import { isObject } from "@harmoniclabs/obj-utils";
import { toHex } from "@harmoniclabs/uint8array-utils";

/** invalid char for normal js identifiers */
export const PEBBLE_INTERNAL_IDENTIFIER_PREFIX = "§";
/** invalid char for normal js identifiers */
export const PEBBLE_INTERNAL_IDENTIFIER_SEPARATOR = "#";

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
        && isObject( globalThis.crypto )
        && typeof globalThis.crypto.getRandomValues === "function"
    ) getRandomBytes = globalThis.crypto.getRandomValues.bind( globalThis.crypto );
} catch {}


export function getInternalVarName( name: string ): string
{
    if( typeof name !== "string" || name.length === 0 ) name = PEBBLE_INTERNAL_IDENTIFIER_PREFIX;

    name = name.startsWith( PEBBLE_INTERNAL_IDENTIFIER_PREFIX ) ? name :
        PEBBLE_INTERNAL_IDENTIFIER_PREFIX + name;

    const originalName = name;

    if( internalNamesUsed.has( name ) || name === PEBBLE_INTERNAL_IDENTIFIER_PREFIX )
    {
        const bytes = new Uint8Array( Math.max( 1, Math.log1p( internalNamesUsed.size ) >>> 0 ) );
        do {
            name = originalName + toHex( getRandomBytes( bytes ) );
        } while( internalNamesUsed.has( name ) );
    }
    internalNamesUsed.add( name );
    return name;
}

export function isInternalName( name: string ): boolean
{
    return name.startsWith( PEBBLE_INTERNAL_IDENTIFIER_PREFIX ); // && isIdentifier( name.slice( 1 ) );
}