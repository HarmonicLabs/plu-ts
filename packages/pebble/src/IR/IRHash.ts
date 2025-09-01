import { blake2b_128 } from "@harmoniclabs/crypto";
import { toHex } from "@harmoniclabs/uint8array-utils";

export type IRHash = Readonly<Uint32Array> & { length: 4 };

const _hash_cache: Map<string, WeakRef<IRHash>> = new Map();
// double up to 256; then scale linearly
const _MAX_DOUBLING_CACHE_SIZE = 256;
const _MIN_CACHE_SIZE = 32;
let _cleanSize: number = _MIN_CACHE_SIZE;

function _cleanCache(): void
{
    // scale down
    if( _hash_cache.size < _cleanSize ) {
        if( _cleanSize <= _MIN_CACHE_SIZE ) return; // don't clean unitl minimum size

        const halfSize = _cleanSize >= (_MAX_DOUBLING_CACHE_SIZE * 2) ? _cleanSize - _MAX_DOUBLING_CACHE_SIZE : _cleanSize >>> 1;
        if( _hash_cache.size < halfSize ) _cleanSize = halfSize
    }
    
    // cleaning
    for( const [ key, ref ] of _hash_cache.entries() )
    {
        if( ref.deref() === undefined ) _hash_cache.delete( key );
    }

    // scale up
    if( _hash_cache.size >= _cleanSize )
    {
        _cleanSize = _cleanSize >= _MAX_DOUBLING_CACHE_SIZE ?
            _cleanSize + _MAX_DOUBLING_CACHE_SIZE :
            _cleanSize * 2;
    }

}

export function hashIrData( data: Uint8Array ): IRHash
{
    const hash8 = blake2b_128( data );
    const key = toHex( hash8 );
    const cached = _hash_cache.get( key )?.deref();
    if( isIRHash( cached ) ) return cached;

    const result = new Uint32Array( hash8.buffer ) as IRHash;
    _hash_cache.set( key, new WeakRef( result ) );
    _cleanCache();
    return result;
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
    return new Uint32Array([
        parseInt( hex.slice( 0, 8 ), 16 ),
        parseInt( hex.slice( 8, 16 ), 16 ),
        parseInt( hex.slice( 16, 24 ), 16 ),
        parseInt( hex.slice( 24, 32 ), 16 )
    ]) as any;
}