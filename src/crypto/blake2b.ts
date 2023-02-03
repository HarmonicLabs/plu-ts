import { BasePlutsError } from "../errors/BasePlutsError";
import ObjectUtils from "../utils/ObjectUtils";
import { buffToByteArr, byte, uint64 as uint64_t } from "./types";
import { byteArrToHex, forceUint64, uint64, uint64Rotr, uint64ToBytesLE } from "./types";
import { Buffer } from "buffer";
/**
 * 128 bytes (16*8 byte words)
 */
const WIDTH: number = 128;

const SIGMA = ObjectUtils.freezeAll([
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
]);

function pad(src: byte[]): byte[]
{
    let dst = src.slice();

    let nZeroes = dst.length == 0 ? WIDTH : (WIDTH - dst.length%WIDTH)%WIDTH;

    // just padding with zeroes, the actual message length is used during compression stage of final block in order to uniquely hash messages of different lengths
    for (let i = 0; i < nZeroes; i++) {
        dst.push(0);
    }
    
    return dst;
}

/**
     * Initialization vector
     */
const IV = Object.freeze([
    uint64( "0x6a09e667f3bcc908" ), 
    uint64( "0xbb67ae8584caa73b" ),
    uint64( "0x3c6ef372fe94f82b" ), 
    uint64( "0xa54ff53a5f1d36f1" ),
    uint64( "0x510e527fade682d1" ),
    uint64( "0x9b05688c2b3e6c1f" ),
    uint64( "0x1f83d9abfb41bd6b" ), 
    uint64( "0x5be0cd19137e2179" ), 
]);

/**
 * @param {uint64[]} v
 * @param {uint64[]} chunk
 * @param {number} a - index
 * @param {number} b - index
 * @param {number} c - index
 * @param {number} d - index
 * @param {number} i - index in chunk for low word 1
 * @param {number} j - index in chunk for low word 2
 */
function mix(v: uint64_t[], chunk: uint64_t[], a: number, b: number, c: number, d: number, i: number, j: number) {
    const x = chunk[i];
    const y = chunk[j];

    v[a] = forceUint64(v[a] + v[b] + x);
    v[d] = uint64Rotr((v[d] ^ v[a]) as uint64, 32);
    v[c] = forceUint64(v[c] + v[d]);
    v[b] = uint64Rotr((v[b] ^ v[c]) as uint64, 24);
    v[a] = forceUint64(v[a] + v[b] + y);
    v[d] = uint64Rotr((v[d] ^ v[a]) as uint64, 16);
    v[c] = forceUint64(v[c] + v[d]);
    v[b] = uint64Rotr((v[b] ^ v[c]) as uint64, 63);
}

function compress(h: uint64_t[], chunk: uint64_t[], t: number, last: boolean) {
    // work vectors
    const v = h.slice().concat(IV.slice());

    v[12] = (v[12] ^ uint64( t | 0 )) as uint64; // v[12].high unmodified
    // v[13] unmodified

    if(last)
    {
        v[14] = (v[14] ^ (BigInt("0xffffffffffffffff"))) as uint64;
    }

    for (let round = 0; round < 12; round++) {
        const s = SIGMA[round%10];

        for (let i = 0; i < 4; i++) {
            mix(v, chunk, i, i+4, i+8, i+12, s[i*2], s[i*2+1]);
        }
        
        for (let i = 0; i < 4; i++) {
            mix(v, chunk, i, (i+1)%4 + 4, (i+2)%4 + 8, (i+3)%4 + 12, s[8+i*2], s[8 + i*2 + 1]);
        }
    }

    for (let i = 0; i < 8; i++)
    {
        h[i] = ((h[i] ^ v[i]) ^ v[i+8]) as uint64;
    }		
}

/**
 * getulates blake2-256 (32 bytes) hash of a list of uint8 numbers.
 * Result is also a list of uint8 number.
 * @example                                        
 * bytesToHex(blake2b([0, 1])) => "01cf79da4945c370c68b265ef70641aaa65eaa8f5953e3900d97724c2c5aa095"
 * @example
 * bytesToHex(blake2b(textToBytes("abc"), 64)) => "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923"
 */
export function blake2b( bytes: byte[] | Buffer, digestSize : 28 | 32 | 64 = 32 ): byte[]
{
    if(!(
        digestSize === 28 ||
        digestSize === 32 ||
        digestSize === 64
    )) throw new BasePlutsError("invalid blake2b digest size");
    if( Buffer.isBuffer( bytes ) )
    {
        bytes = buffToByteArr( bytes );
    }

    const nBytes = bytes.length;

    bytes = pad(bytes);

    // init hash vector
    const h = IV.slice();
    
    // setup the param block
    const paramBlock = new Uint8Array(64);
    paramBlock[0] = digestSize; // n output  bytes
    paramBlock[1] = 0; // key-length (always zero in our case) 
    paramBlock[2] = 1; // fanout
    paramBlock[3] = 1; // depth

    //mix in the parameter block
    let paramBlockView = new DataView(paramBlock.buffer);
    
    for (let i = 0; i < 8; i++)
    {
        h[i] = (h[i] ^ paramBlockView.getBigUint64(i*8,true)) as uint64;
    }
    
    // loop all chunks
    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += WIDTH)
    {
        const chunkEnd = chunkStart + WIDTH; // exclusive
        const chunk = bytes.slice(chunkStart, chunkStart + WIDTH);

        const chunk64 = new Array(WIDTH/8);
        for (let i = 0; i < WIDTH; i += 8) {
            chunk64[i/8] = uint64( "0x" + byteArrToHex( chunk.slice(i, i+8).reverse() ) );
        }
        
        compress(
            h,
            chunk64,
            nBytes,
            chunkStart == bytes.length - WIDTH // is last blocks
        );
    }

    // extract lowest BLAKE2B_DIGEST_SIZE (28, 32 or 64) bytes from h

    const hash: byte[] = [];
    const n = Math.ceil(digestSize / 8)
    for (let i = 0; i < n ; i++)
    {
        hash.push( ...uint64ToBytesLE(h[i]) );
    }

    return hash.slice(0, digestSize);
}

export default blake2b;

export function blake2b_224( data: byte[] | Buffer ): byte[]
{
    return blake2b( data, 28 );
}

export function blake2b_256( data: byte[] | Buffer ): byte[]
{
    return blake2b( data, 32 );
}

export function blake2b_512( data: byte[] | Buffer ): byte[]
{
    return blake2b( data, 64 );
}