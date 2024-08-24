import { blake2b_128 } from "@harmoniclabs/crypto";
import { toHex } from "@harmoniclabs/uint8array-utils";

export type IRHash = Readonly<Uint32Array> & { length: 4 };

export function hashIrData( data: Uint8Array ): IRHash
{
    const hash8 = blake2b_128( data );
    return new Uint32Array( hash8.buffer ) as any;
}

export function isIRHash( hash: any ): hash is IRHash
{
    return (
        // most of the time we are checking an undefined value
        // we just shortcut here
        hash !== undefined &&
        hash instanceof Uint32Array &&
        hash.length === 4
    );
}

export function equalIrHash( a: IRHash, b: IRHash ): boolean
{
    return (
        // a instanceof Uint32Array &&
        // b instanceof Uint32Array &&
        // a.length === 4 &&
        // b.length === 4 &&
        a[0] === b[0] &&
        a[1] === b[1] &&
        a[2] === b[2] &&
        a[3] === b[3]
    );
}

export function irHashToHex( hash: IRHash ): string
{
    return toHex(
        new Uint8Array(
            hash.buffer
        )
    );
}

export function irHashFromHex( hex: string ): IRHash
{
    if( hex.length !== 32 && !/^[0-9a-fA-F]$/.test( hex ) )
    {
        throw new Error("invalid hex string for IRHash");
    }
    return new Uint32Array( [
        parseInt( hex.slice( 0, 8 ), 16 ),
        parseInt( hex.slice( 8, 16 ), 16 ),
        parseInt( hex.slice( 16, 24 ), 16 ),
        parseInt( hex.slice( 24, 32 ), 16 )
    ] ) as any;
}