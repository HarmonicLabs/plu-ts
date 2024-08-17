/*
    MurmurHash2_64B 
    ---------------
    64-bit MurmurHash2 implemented by bryc (github.com/bryc)

    go follow them, amazing stuff

    original implementation: https://github.com/bryc/code/blob/da36a3e07acfbd07f930a9212a2df9e854ff56e4/jshash/hashes/murmurhash2_64b.js
*/

import { blake2b } from "@harmoniclabs/crypto";

/**
 * try to workaround babel polyfill
 * 
 * if we are in a ES6 environment we want to use `imul`;
 * if not present simple multiplication works
 * 
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
 */
const imul = Math["imul"] ?? Math.imul ?? (function( a, b ) { return a * b; });

export function murmurHash( data: Uint8Array ): number
{
    let seed = 0;
    let k1, k2, m = 1540483477, h1 = seed ^ data.length, h2 = h1 ^ m;

    // -8 is just `Number("0b11111111111111111111111111111000") | 0`
    // so b is the length rounded down every 8
    let i = 0, b = data.length & -8;
    while(i < b) {
        k1 = data[i+3] << 24 | data[i+2] << 16 | data[i+1] << 8 | data[i];
        k1 = imul(k1, m); k1 ^= k1 >>> 24;
        h1 = imul(h1, m) ^ imul(k1, m); h1 ^= h2;
        i += 4;
        k2 = data[i+3] << 24 | data[i+2] << 16 | data[i+1] << 8 | data[i];
        k2 = imul(k2, m); k2 ^= k2 >>> 24;
        h2 = imul(h2, m) ^ imul(k2, m); h2 ^= h1;
        i += 4;
    }
    
    if(data.length - b >= 4) { // handle the final 4-byte block
        k1 = data[i+3] << 24 | data[i+2] << 16 | data[i+1] << 8 | data[i];
        k1 = imul(k1, m); k1 ^= k1 >>> 24;
        h1 = imul(h1, m) ^ imul(k1, m); h1 ^= h2;
        i += 4;
    }

    switch (data.length & 3) {
        case 3: h2 ^= data[i+2] << 16;
        case 2: h2 ^= data[i+1] << 8;
        case 1: h2 ^= data[i];
                h2 = imul(h2, m); h2 ^= h1;
    }

    h1 ^= h2 >>> 18; h1 = imul(h1, m);
    h2 ^= h1 >>> 22; h2 = imul(h2, m);
    h1 ^= h2 >>> 17; h1 = imul(h1, m);
    h2 ^= h1 >>> 19; h2 = imul(h2, m);

    // return [h1 >>> 0, h2 >>> 0];
    // 52-bit output: h2 + (h1 & 2097151) * 4294967296;

    /*
    the part below was not present in the original implementation.

    this preserves all 64 bits AND allows it to be a number
    BUT is slower.

    # WHY THE HASH IS A NUMBER?

    because with `Uint8Array` is incredibly easy to mess up
    either because you have to remember to clone (`Uint8Array.prototype.slice.call( bytes )`)
    or because cloning you fill up the memory

    numbers are passed by value by default, so we can't mess up,
    and they should be somewhat memory friendly for js engines

    ALSO

    we have builtin equality (`===`) which is without doubt
    an important performance improvement compared to `eqUint8Arr` wich is O(n)

    especially considered that the entire purpose of hashes it to compare them
    */

    let result = 0;
    // defined scope for buffers so we are sure we garbage collect them
    {
        const buff = new ArrayBuffer( 8 );
        const int = new Int32Array( buff );
        const num = new Float64Array( buff );
        int[0] = h1 >>> 0;
        int[1] = h2 >>> 0;
        result = num[0];
    }

    return result;
}

export function floatAsBytes( float: number ): Uint8Array & { length: 8 }
{
    const buff = new ArrayBuffer( 8 );
    const bytes = new Uint8Array( buff );
    const flt = new Float64Array( buff );
    flt[0] = float;
    return bytes as any;
}

export function isMurmurHash( stuff: any ): stuff is number
{
    return typeof stuff === "number" && Number.isFinite( stuff );
}