import { blake2b_128 } from "@harmoniclabs/crypto";
import { fromHex, toBase64, toHex } from "@harmoniclabs/uint8array-utils";

export type IRHash = number;

// HASH GENERATOR

const MAX_SAFE_INTEGER = Number( globalThis.Number?.MAX_SAFE_INTEGER ?? ((2**53) - 1) );
const MIN_SAFE_INTEGER = Number( globalThis.Number?.MIN_SAFE_INTEGER ?? -MAX_SAFE_INTEGER );

let _preimage_to_hash: Record<string, IRHash | undefined> = {};
let _next_hash = MIN_SAFE_INTEGER;

function _getNextHash(): IRHash
{
    if( _next_hash >= MAX_SAFE_INTEGER )
    throw new Error("ran out of IR hashes");
    return _next_hash++;
}

export function __VERY_UNSAFE_FORGET_IRHASH_ONLY_USE_AT_END_OF_UPLC_COMPILATION(): void
{
    _preimage_to_hash = {};
    _next_hash = MIN_SAFE_INTEGER;
}

// HASH UTILS

function _positiveHash( hash: number ): bigint
{
    return BigInt( hash ) + BigInt( MAX_SAFE_INTEGER ) + BigInt( 1 );
}

function _fromPositiveHash( posHash: bigint ): number
{
    const res = Number( posHash - BigInt( MAX_SAFE_INTEGER ) - BigInt( 1 ) );
    if( !isIRHash( res ) ) throw new Error("internal error: invalid hash generated");
    return res;
}

// END HASH GENERATOR

export function hashIrData( data: Uint8Array ): IRHash
{
    const preimage = toBase64( data );
    const exsisting = _preimage_to_hash[ preimage ];
    if( typeof exsisting === "number" ) return exsisting;

    const nextHash = _getNextHash();
    _preimage_to_hash[ preimage ] = nextHash;
    return nextHash;
}

export function isIRHash( hash: any ): hash is IRHash
{
    return (
        typeof hash === "number"
        && hash === hash // not NaN
        && hash <= MAX_SAFE_INTEGER
        && hash >= MIN_SAFE_INTEGER
        && BigInt( hash ) <= hash
        && BigInt( hash ) >= hash
    );
}

export function equalIrHash( a: IRHash, b: IRHash ): boolean
{
    // we can allow ourselves to use standard equality
    // only because we always return the same object for the same hash
    return a === b;
    /*
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
    //*/
}

export function irHashToHex( hash: IRHash ): string
{
    return _positiveHash( hash )
    .toString( 16 )
    // we MUST pad to 16 chars
    // otherwise, hash concatenation could be ambiguous
    .padStart( 16, "0" );
}

export function irHashFromHex( hex: string ): IRHash
{
    return _fromPositiveHash( BigInt( "0x" + hex ) );
}

export function irHashToBytes( hash: IRHash ): Uint8Array
{
    return fromHex( irHashToHex( hash ) );
}