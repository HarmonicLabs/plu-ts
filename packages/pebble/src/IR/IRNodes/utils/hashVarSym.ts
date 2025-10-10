// HASH GENERATOR

import { fromHex } from "@harmoniclabs/uint8array-utils";

const MAX_SAFE_INTEGER = Number( globalThis.Number?.MAX_SAFE_INTEGER ?? ((2**53) - 1) );
const MIN_SAFE_INTEGER = Number( globalThis.Number?.MIN_SAFE_INTEGER ?? -MAX_SAFE_INTEGER );

const _sym_to_hash: WeakMap<symbol, number> = new WeakMap();
// we cannot store the symbol itself as it would prevent garbage collection
// so we store its description instead, which is a string
// and then we get the symbol back from the globla symbol registry using `Symbol.for`
const _hash_to_sym_descr: Map<number, string> = new Map();
let _next_hash = MIN_SAFE_INTEGER;

const unusedHashes: number[] = [];
function _collectUnusedHashes(): void
{
    for( const [h, s] of _hash_to_sym_descr )
    {
        const newSymbol = Symbol.for( s );
        if( !_sym_to_hash.has( newSymbol ) )
        {
            _hash_to_sym_descr.delete( h );
            unusedHashes.push( h );
        }
    }
}

export function hashVarSym( s: symbol ): Uint8Array
{
    const limitReached = _next_hash >= MAX_SAFE_INTEGER;
    if(
        _next_hash % 0xffff === 0
        || limitReached
    ) _collectUnusedHashes();

    if(
        limitReached
        && unusedHashes.length <= 0
    ) throw new Error("ran out of IR hashes");

    const result_hash = unusedHashes.shift() ?? _next_hash++;
    _sym_to_hash.set( s, result_hash );
    if( typeof s.description === "string" ) _hash_to_sym_descr.set( result_hash, s.description );

    return fromHex(
        (BigInt( result_hash ) + BigInt( MAX_SAFE_INTEGER ))
        .toString(16)
        .padStart(16, "0")
    );
}