/*
    A collection of cryptography primitives are included here in order to avoid external dependencies
    mulberry32: random number generator
    base32 encoding and decoding
    bech32 encoding, checking, and decoding
    sha2_256, sha2_512, sha3 and blake2b hashing
    ed25519 pubkey generation, signing, and signature verification (NOTE: the current implementation is very slow)
*/

import { Buffer } from "buffer";
import BitStream from "../types/bits/BitStream";
import BasePlutsError from "../errors/BasePlutsError";
import JsRuntime from "../utils/JsRuntime";
import ObjectUtils from "../utils/ObjectUtils";
import BigIntUtils from "../utils/BigIntUtils";

export type NumberGenerator = Generator<number,void,number>

/**
 * Returns a simple random number generator
 * @param {number} seed
 * @returns {NumberGenerator} - a random number generator
 */
export function* mulberry32(seed: number): NumberGenerator
{
    while(true)
    {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        seed = ((t ^ t >>> 14) >>> 0) / 4294967296;
        yield seed;
    }
}

/**
 * Alias for rand generator of choice
 * @returns {NumberGenerator} - the random number generator function
 */
export function rand(): NumberGenerator
{
    return mulberry32(Date.now());
}

function positiveMod(x: bigint, n: bigint): bigint
{
    const _n = BigInt( n );
	const res = BigInt( x ) % _n;
    return res < BigInt(0) ? res + _n : res;
}

const rfc4648_ALPHABET = Object.freeze([
    'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z', '2', '3',
    '4', '5', '6', '7'
] as const);

const BECH32_BASE32_ALPHABET = Object.freeze([
    'q', 'p', 'z', 'r', 'y', '9', 'x',
    '8', 'g', 'f', '2', 't', 'v', 'd',
    'w', '0', 's', '3', 'j', 'n', '5',
    '4', 'k', 'h', 'c', 'e', '6', 'm',
    'u', 'a', '7', 'l'] as const);

type rfc4648char = typeof rfc4648_ALPHABET[number];

function isRfc4648Base32String( str: string ): boolean
{
    return str.split('').every( rfc4648_ALPHABET.includes as any )
}

export function encodeBase32rfc4648(bytes: Buffer)
{
    return buffToUint5Arr(bytes).map(c => rfc4648_ALPHABET[c]).join("");
}

type uint5 = 
    0  | 1  | 2  | 3  | 4  | 5  | 6  | 7  |
    8  | 9  | 10 | 11 | 12 | 13 | 14 | 15 |
    16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
    24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 ;

type uint6 = uint5 |
    32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 |
    40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 |
    48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 |
    56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 ;

function isUint6( n: number ): n is uint6
{
    return (
        typeof n === "number" &&
        n >= 0 && n <= 63 &&
        n === Math.round( n )
    );
}

type byte = 0  |
    1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
    11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  | 20  |
    21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  | 30  |
    31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  | 40  |
    41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  | 50  |
    51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  | 60  |
    61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  | 70  |
    71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  | 80  |
    81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  | 90  |
    91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  | 100 |
    101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 |
    111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 |
    121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 |
    131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 |
    141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 |
    151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 |
    161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 |
    171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 |
    181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 |
    191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 |
    201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 |
    211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 |
    221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 |
    231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 |
    241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 |
    251 | 252 | 253 | 254 | 255 ;

type uint8 = byte;

function byteArrToHex( bytes: byte[] ): string
{
    return bytes.reduce( (acc, val) => acc + val.toString(16).slice(0,2), '' )
}

/**
 * Internal method
 * 
 * `bytes` is padded at the end to match the
 * @param {Buffer} bytes 
 * @returns {uint5[]} - list of numbers between 0 and 31
 */
export function buffToUint5Arr(bytes: Buffer): uint5[]
{
    const result: uint5[] = [];

    let bits: string | ('0'|'1')[] = new BitStream( bytes ).toBinStr().asString;
    const mod5Len = bits.length % 5;
    if( mod5Len !== 0 )
    {
        bits = bits.padEnd( bits.length + ( 5 - mod5Len ) ,'0');
    }

    bits = bits.split('') as ('0'|'1')[];

    for( let i = 0; i < bits.length; )
    {
        result.push(
            Number( `0b${bits[i++]}${bits[i++]}${bits[i++]}${bits[i++]}${bits[i++]}` ) as uint5
        );
    }
    
    return result;
}

function decodeBase32( base32Str: string, alpabeth: readonly string[] )
{
    if( !isRfc4648Base32String( base32Str ) )
    throw new BasePlutsError(
        "can't decode base 32 a string that is not in base 32"
    );

    const len = base32Str.length;

    let bits: string = '';

    for (let i = 0; i < len - 1; i++)
    {    
        const num = rfc4648_ALPHABET.indexOf(
            base32Str[i].toLowerCase() as rfc4648char
        );

        bits += num.toString(2).padStart( 5, '0' );
    }
    // last, make sure we align to byte
    let nCut = len*5 - 8*Math.floor(len*5/8);

    const num = rfc4648_ALPHABET.indexOf(
        base32Str[len - 1].toLowerCase() as rfc4648char
    );
    let lastbits = num.toString(2).padStart( 5, '0' );

    bits += lastbits.slice(0, 5 - nCut);

    return BitStream.fromBinStr( bits ).toBuffer().buffer;
}

export function decodeBase32rfc4648( base32Str: string )
{
    return decodeBase32( base32Str, rfc4648_ALPHABET );
}

export function decodeBase32Bech32( base32Str: string )
{
    return decodeBase32( base32Str, BECH32_BASE32_ALPHABET );
}
/**
 * Expand human readable prefix of the bech32 encoding so it can be used in the checkSum
 * Internal method.
 * @param {string} hrp
 * @returns {byte[]}
 */
export function expandBech32HumanReadablePart(hrp: string): byte[] 
{
    let bytes = [];
    for (let c of hrp) {
        bytes.push(c.charCodeAt(0) >> 5);
    }

    bytes.push(0);

    for (let c of hrp) {
        bytes.push(c.charCodeAt(0) & 31);
    }

    return bytes as any;
}

/**
 * Used as part of the bech32 checksum.
 * Internal method.
 * @param {byte[]} bytes 
 * @returns {number}
 */
export function getBech32Polymod(bytes: byte[]): number
{
    const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

    let chk = 1;
    for (let b of bytes) {
        let c = (chk >> 25);
        chk = (chk & 0x1fffffff) << 5 ^ b;

        for (let i = 0; i < 5; i++) {
            if (((c >> i) & 1) != 0) {
                chk ^= GEN[i];
            }
        }
    }

    return chk;
}

/**
 * Generate the bech32 checksum
 * Internal method
 * @param {string} humanReadablePart 
 * @param {uint5[]} data - numbers between 0 and 32
 * @returns {[uint5,uint5,uint5,uint5,uint5,uint5]} - 6 numbers between 0 and 32
 */
export function getBech32Checksum(humanReadablePart: string, data: uint5[]): [uint5,uint5,uint5,uint5,uint5,uint5]
{
    let bytes = expandBech32HumanReadablePart(humanReadablePart).concat(data);

    let chk = getBech32Polymod(bytes.concat([0,0,0,0,0,0])) ^ 1;

    let chkSum = [];
    for (let i = 0; i < 6; i++) {
        chkSum.push((chk >> 5 * (5 - i)) & 31);
    }

    return chkSum as any;
}

/**
 * Creates a bech32 checksummed string (used to represent Cardano addresses)
 * @example
 * encodeBech32("foo", textToBytes("foobar")) => "foo1vehk7cnpwgry9h96"
 * @example
 * encodeBech32("addr_test", hexToBytes("70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539")) => "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld"
 * @param {string} humanReadablePart 
 * @param {byte[]} data - uint8 0 - 256
 * @returns {string}
 */
export function encodeBech32(humanReadablePart: string, data: byte[] | Buffer ) {
    JsRuntime.assert(humanReadablePart.length > 0, "human-readable-part must have non-zero length");

    const _data = buffToUint5Arr( 
        Buffer.isBuffer(data) ? data : Buffer.from(data)
    );

    return humanReadablePart + "1" + 
        _data.concat(
            getBech32Checksum(
                humanReadablePart,
                _data
            )
        ).map( val => BECH32_BASE32_ALPHABET[val]).join("");
}

/**
 * Decomposes a bech32 checksummed string (i.e. Cardano address), and returns the human readable part and the original bytes
 * Throws an error if checksum is invalid.
 * @example
 * bytesToHex(decodeBech32("addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld")[1]) => "70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539"
 * @param {string} addr 
 * @returns {[humanReadablePart: string, bytes: byte[]]}
 */
export function decodeBech32(addr: string): [humanReadablePart: string, bytes: byte[]]
{
    JsRuntime.assert( isBech32(addr), "invalid bech32 addr");

    let i = addr.indexOf("1");

    JsRuntime.assert(i != -1, "bech32 address missing the '1' separator");

    let hrp = addr.slice(0, i);

    addr = addr.slice(i+1);

    let data = decodeBase32Bech32( addr.slice(0, addr.length - 6) );

    return [hrp, Array.from( data ) as byte[]];
}

/**
 * Verify a bech32 checksum
 * @example
 * isBech32("foo1vehk7cnpwgry9h96") => true
 * @example
 * isBech32("foo1vehk7cnpwgry9h97") => false
 * @example
 * isBech32("a12uel5l") => true
 * @example
 * isBech32("mm1crxm3i") => false
 * @example
 * isBech32("A1G7SGD8") => false
 * @example
 * isBech32("abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw") => true
 * @example
 * isBech32("?1ezyfcl") => true
 * @example
 * isBech32("addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld") => true
 * @param {string} addr
 * @returns {boolean}
 */
export function isBech32(addr: string): boolean
{
    let data = [];

    let i = addr.indexOf("1");
    if (i == -1 || i == 0) {
        return false;
    }

    let hrp = addr.slice(0, i);

    addr = addr.slice(i + 1);

    for (let ch of addr) {
        let j = BECH32_BASE32_ALPHABET.indexOf(ch as any);
        if (j == -1) {
            return false;
        }

        data.push(j);
    }

    let chkSumA = data.slice(data.length - 6);

    let chkSumB = getBech32Checksum(hrp, data.slice(0, data.length - 6) as any);

    for (let i = 0; i < 6; i++) {
        if (chkSumA[i] != chkSumB[i]) {
            return false;
        }
    }

    return true;
}

function rotr32( x: number, by: uint5 ): number
{
    return ( x >>> by ) | ( x << (32 - by)) | 0;
}

type uint64 = bigint & { __uint64__: never };

function uint64( n: string | number | bigint | boolean ): uint64
{
    const _n = BigInt( n );
    if( !isUint64(_n) )
    throw new BasePlutsError("cant convert " + n + " to uint64");
    
    return _n;
}

function forceUint64( n: string | number | bigint | boolean ): uint64
{
    return (BigInt( n ) & BigInt( "18446744073709551615" )) as uint64;
}

function isUint64( n: bigint ): n is uint64
{
    return (
        typeof n === "bigint" &&
        n >= BigInt( 0 ) &&
        n < BigInt( "18446744073709551616" ) // n < (1 << 64)
    )
}

function uint64ToBytesLE( uint: uint64 ): [ byte, byte, byte, byte, byte, byte, byte, byte ]
{
    function _byte( bint: bigint ): byte
    {
        return (Number( bint ) & 0xff) as any;
    }

    return [
        _byte(  BigInt( "0x00000000000000ff" ) & uint ),
        _byte( (BigInt( "0x000000000000ff00" ) & uint) >> BigInt( 8  ) ),
        _byte( (BigInt( "0x0000000000ff0000" ) & uint) >> BigInt( 16 ) ),
        _byte( (BigInt( "0x00000000ff000000" ) & uint) >> BigInt( 24 ) ),
        _byte( (BigInt( "0x000000ff00000000" ) & uint) >> BigInt( 32 ) ),
        _byte( (BigInt( "0x0000ff0000000000" ) & uint) >> BigInt( 40 ) ),
        _byte( (BigInt( "0x00ff000000000000" ) & uint) >> BigInt( 48 ) ),
        _byte( (BigInt( "0xff00000000000000" ) & uint) >> BigInt( 56 ) ),
    ];
}

function uint64ToBytesBE( uint: uint64 ): byte[]
{
    return uint64ToBytesLE( uint ).reverse();
}

function uint64Rotr( a: uint64, b: uint6 ): uint64
{
    JsRuntime.assert(
        isUint64( a ) && isUint6( b ),
        "invalid args for 'uint64And'"
    );
    
    if( b === 0 ) return a;
    const _b = BigInt(b);
    return (
        (a >> _b) | (a << ( BigInt(64) - _b ))
    ) as any;
}

/**
 * getulates sha2-256 (32bytes) hash of a list of uint8 numbers.
 * Result is also a list of uint8 number.
 * @example 
 * bytesToHex(sha2_256([0x61, 0x62, 0x63])) => "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
 * @example
 * sha2_256(textToBytes("Hello, World!")) => [223, 253, 96, 33, 187, 43, 213, 176, 175, 103, 98, 144, 128, 158, 195, 165, 49, 145, 221, 129, 199, 247, 10, 75, 40, 104, 138, 54, 33, 130, 152, 111]
 * @param {uint5[]} bytes - list of uint8 numbers
 * @returns {number[]} - list of uint8 numbers
 */
export function sha2_256(bytes: byte[]):  byte[]
{
    /**
     * Pad a bytearray so its size is a multiple of 64 (512 bits).
     * Internal method.
     * @param {number[]} src - list of uint8 numbers
     * @returns {number[]}
     */
    function pad(src: byte[]): byte[]
    {
        let nBits = src.length*8;
        
        let dst = src.slice();

        dst.push(0x80);

        let nZeroes = (64 - dst.length%64) - 8;
        if (nZeroes < 0) {
            nZeroes += 64;
        }

        for (let i = 0; i < nZeroes; i++) {
            dst.push(0);
        }

        // assume nBits fits in 32 bits

        dst.push(0);
        dst.push(0);
        dst.push(0);
        dst.push(0);
        dst.push( ((nBits >> 24) & 0xff) as byte);
        dst.push( ((nBits >> 16) & 0xff) as byte);
        dst.push( ((nBits >> 8)  & 0xff) as byte);
        dst.push( ((nBits >> 0)  & 0xff) as byte);
        
        return dst;
    }

    /**
     * @type {number[]} - 64 uint32 numbers
     */
    const k: number[] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    /**
     * Initial hash (updated during compression phase)
     * @type {number[]} - 8 uint32 number
     */
    const hash: number[] = [
        0x6a09e667, 
        0xbb67ae85, 
        0x3c6ef372, 
        0xa54ff53a, 
        0x510e527f, 
        0x9b05688c, 
        0x1f83d9ab, 
        0x5be0cd19,
    ];

    function sigma0(x: number): number
    {
        return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
    }

    function sigma1(x: number ): number
    {
        return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
    }

    bytes = pad(bytes);

    // break message in successive 64 byte chunks
    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
        let chunk = bytes.slice(chunkStart, chunkStart + 64);

        let w = (new Array(64)).fill(0); // array of 32 bit numbers!

        // copy chunk into first 16 positions of w
        for (let i = 0; i < 16; i++) {
            w[i] = (chunk[i*4 + 0] << 24) |
                    (chunk[i*4 + 1] << 16) |
                    (chunk[i*4 + 2] <<  8) |
                    (chunk[i*4 + 3]);
        }

        // extends the first 16 positions into the remaining 48 positions
        for (let i = 16; i < 64; i++) {
            w[i] = (w[i-16] + sigma0(w[i-15]) + w[i-7] + sigma1(w[i-2])) | 0;
        }

        // intialize working variables to current hash value
        let a = hash[0];
        let b = hash[1];
        let c = hash[2];
        let d = hash[3];
        let e = hash[4];
        let f = hash[5];
        let g = hash[6];
        let h = hash[7];

        // compression function main loop
        for (let i = 0; i < 64; i++) {
            let S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
            let ch = (e & f) ^ ((~e) & g);
            let temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
            let S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = (S0 + maj) | 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }

        // update the hash
        hash[0] = (hash[0] + a) | 0;
        hash[1] = (hash[1] + b) | 0;
        hash[2] = (hash[2] + c) | 0;
        hash[3] = (hash[3] + d) | 0;
        hash[4] = (hash[4] + e) | 0;
        hash[5] = (hash[5] + f) | 0;
        hash[6] = (hash[6] + g) | 0;
        hash[7] = (hash[7] + h) | 0;
    }

    // produce the final digest of uint8 numbers
    let result = [];
    for (let i = 0; i < 8; i++) {
        let item = hash[i];

        result.push( ((item >> 24) & 0xff) as byte );
        result.push( ((item >> 16) & 0xff) as byte );
        result.push( ((item >>  8) & 0xff) as byte );
        result.push( ((item >>  0) & 0xff) as byte );
    }

    return result as any;
}

/**
 * getulates sha2-512 (64bytes) hash of a list of uint8 numbers.
 * Result is also a list of uint8 number.
 * @example 
 * bytesToHex(sha2_512([0x61, 0x62, 0x63])) => "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
 * @example 
 * bytesToHex(sha2_512([])) => "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
 * @param {number[]} bytes - list of uint8 numbers
 * @returns {number[]} - list of uint8 numbers
 */
export function sha2_512( bytes: byte[] ): byte[]
{
    /**
     * Pad a bytearray so its size is a multiple of 128 (1024 bits).
     * Internal method.
     * @param {number[]} src - list of uint8 numbers
     * @returns {number[]}
     */
    function pad(src: byte[] ) {
        let nBits = src.length*8;

        let dst = src.slice();

        dst.push(0x80);

        let nZeroes = (128 - dst.length%128) - 8;
        if (nZeroes < 0) {
            nZeroes += 128;
        }

        for (let i = 0; i < nZeroes; i++) {
            dst.push(0);
        }

        // assume nBits fits in 32 bits

        dst.push(0);
        dst.push(0);
        dst.push(0);
        dst.push(0);
        dst.push( ((nBits >> 24) & 0xff) as byte );
        dst.push( ((nBits >> 16) & 0xff) as byte );
        dst.push( ((nBits >> 8)  & 0xff) as byte );
        dst.push( ((nBits >> 0)  & 0xff) as byte );
        
        return dst;
    }

    const k: uint64[] = [
        uint64( "0x428a2f98d728ae22" ), uint64( "0x7137449123ef65cd" ), 
        uint64( "0xb5c0fbcfec4d3b2f" ), uint64( "0xe9b5dba58189dbbc" ),
        uint64( "0x3956c25bf348b538" ), uint64( "0x59f111f1b605d019" ), 
        uint64( "0x923f82a4af194f9b" ), uint64( "0xab1c5ed5da6d8118" ),
        uint64( "0xd807aa98a3030242" ), uint64( "0x12835b0145706fbe" ), 
        uint64( "0x243185be4ee4b28c" ), uint64( "0x550c7dc3d5ffb4e2" ),
        uint64( "0x72be5d74f27b896f" ), uint64( "0x80deb1fe3b1696b1" ), 
        uint64( "0x9bdc06a725c71235" ), uint64( "0xc19bf174cf692694" ),
        uint64( "0xe49b69c19ef14ad2" ), uint64( "0xefbe4786384f25e3" ), 
        uint64( "0x0fc19dc68b8cd5b5" ), uint64( "0x240ca1cc77ac9c65" ),
        uint64( "0x2de92c6f592b0275" ), uint64( "0x4a7484aa6ea6e483" ), 
        uint64( "0x5cb0a9dcbd41fbd4" ), uint64( "0x76f988da831153b5" ),
        uint64( "0x983e5152ee66dfab" ), uint64( "0xa831c66d2db43210" ), 
        uint64( "0xb00327c898fb213f" ), uint64( "0xbf597fc7beef0ee4" ),
        uint64( "0xc6e00bf33da88fc2" ), uint64( "0xd5a79147930aa725" ), 
        uint64( "0x06ca6351e003826f" ), uint64( "0x142929670a0e6e70" ),
        uint64( "0x27b70a8546d22ffc" ), uint64( "0x2e1b21385c26c926" ), 
        uint64( "0x4d2c6dfc5ac42aed" ), uint64( "0x53380d139d95b3df" ),
        uint64( "0x650a73548baf63de" ), uint64( "0x766a0abb3c77b2a8" ), 
        uint64( "0x81c2c92e47edaee6" ), uint64( "0x92722c851482353b" ),
        uint64( "0xa2bfe8a14cf10364" ), uint64( "0xa81a664bbc423001" ), 
        uint64( "0xc24b8b70d0f89791" ), uint64( "0xc76c51a30654be30" ),
        uint64( "0xd192e819d6ef5218" ), uint64( "0xd69906245565a910" ), 
        uint64( "0xf40e35855771202a" ), uint64( "0x106aa07032bbd1b8" ),
        uint64( "0x19a4c116b8d2d0c8" ), uint64( "0x1e376c085141ab53" ), 
        uint64( "0x2748774cdf8eeb99" ), uint64( "0x34b0bcb5e19b48a8" ),
        uint64( "0x391c0cb3c5c95a63" ), uint64( "0x4ed8aa4ae3418acb" ), 
        uint64( "0x5b9cca4f7763e373" ), uint64( "0x682e6ff3d6b2b8a3" ),
        uint64( "0x748f82ee5defb2fc" ), uint64( "0x78a5636f43172f60" ), 
        uint64( "0x84c87814a1f0ab72" ), uint64( "0x8cc702081a6439ec" ),
        uint64( "0x90befffa23631e28" ), uint64( "0xa4506cebde82bde9" ), 
        uint64( "0xbef9a3f7b2c67915" ), uint64( "0xc67178f2e372532b" ),
        uint64( "0xca273eceea26619c" ), uint64( "0xd186b8c721c0c207" ), 
        uint64( "0xeada7dd6cde0eb1e" ), uint64( "0xf57d4f7fee6ed178" ),
        uint64( "0x06f067aa72176fba" ), uint64( "0x0a637dc5a2c898a6" ), 
        uint64( "0x113f9804bef90dae" ), uint64( "0x1b710b35131c471b" ),
        uint64( "0x28db77f523047d84" ), uint64( "0x32caab7b40c72493" ), 
        uint64( "0x3c9ebe0a15c9bebc" ), uint64( "0x431d67c49c100d4c" ),
        uint64( "0x4cc5d4becb3e42b6" ), uint64( "0x597f299cfc657e2a" ), 
        uint64( "0x5fcb6fab3ad6faec" ), uint64( "0x6c44198c4a475817" ),
    ];

    const hash: uint64[] = [
        uint64( "0x6a09e667f3bcc908" ),
        uint64( "0xbb67ae8584caa73b" ),
        uint64( "0x3c6ef372fe94f82b" ),
        uint64( "0xa54ff53a5f1d36f1" ),
        uint64( "0x510e527fade682d1" ),
        uint64( "0x9b05688c2b3e6c1f" ),
        uint64( "0x1f83d9abfb41bd6b" ),
        uint64( "0x5be0cd19137e2179" ),
    ];

    function sigma0(x: uint64): uint64
    {
        return ((uint64Rotr( x, 1 ) ^ uint64Rotr( x, 8 )) ^ ( x >> BigInt(7) )) as any;
    }

    function sigma1(x: uint64): uint64
    {
        return ((uint64Rotr( x, 19 ) ^ uint64Rotr( x, 61 )) ^ ( x >> BigInt(6) )) as any;
    }

    bytes = pad(bytes);

    // break message in successive 64 byte chunks
    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 128) {
        let chunk = bytes.slice(chunkStart, chunkStart + 128);

        let w: uint64[] = (new Array(80)).fill( uint64( 0 ) ); // array of 32 bit numbers!

        // copy chunk into first 16 hi/lo positions of w (i.e. into first 32 uint32 positions)
        for (let i = 0; i < 16; i++) {
            w[i] = uint64( "0x" + byteArrToHex( chunk.slice(i*8, i*8 + 8) ) );
        }

        // extends the first 16 positions into the remaining 80 positions
        for (let i = 16; i < 80; i++) {
            w[i] = forceUint64(sigma1(w[i-2]) + w[i-7] + sigma0(w[i-15]) + w[i-16]);
        }

        // intialize working variables to current hash value
        let a = hash[0];
        let b = hash[1];
        let c = hash[2];
        let d = hash[3];
        let e = hash[4];
        let f = hash[5];
        let g = hash[6];
        let h = hash[7];

        // compression function main loop
        for (let i = 0; i < 80; i++) {
            let S1 = ((uint64Rotr(e, 14) ^ uint64Rotr(e, 18)) ^ uint64Rotr(e, 41)) as uint64
            let ch = ( ( e & f ) ^ ( (~e) & g ) ) as uint64;
            let temp1 = forceUint64( h + S1 + ch + k[i] + w[i] );
            let S0 = (uint64Rotr( a, 28 ) ^ uint64Rotr( a, 34 )) ^ (uint64Rotr( a, 39 )) as uint64;
            let maj = ((( a & b ) ^ (a & c)) ^ (b & (c))) as uint64;
            let temp2 = forceUint64(S0 + maj);

            h = g;
            g = f;
            f = e;
            e = forceUint64(d + temp1);
            d = c;
            c = b;
            b = a;
            a = forceUint64(temp1 + temp2);
        }

        // update the hash
        hash[0] = forceUint64(hash[0] + a);
        hash[1] = forceUint64(hash[1] + b);
        hash[2] = forceUint64(hash[2] + c);
        hash[3] = forceUint64(hash[3] + d);
        hash[4] = forceUint64(hash[4] + e);
        hash[5] = forceUint64(hash[5] + f);
        hash[6] = forceUint64(hash[6] + g);
        hash[7] = forceUint64(hash[7] + h);
    }

    // produce the final digest of uint8 numbers
    const result: byte[] = [];
    for (let i = 0; i < 8; i++) {
        let item = hash[i];

        result.push( ...uint64ToBytesBE( hash[i] ) );
    }

    return result;
}

/**
 * getulates sha3-256 (32bytes) hash of a list of uint8 numbers.
 * Result is also a list of uint8 number.
 * Sha3 only bit-wise operations, so 64-bit operations can easily be replicated using 2 32-bit operations instead
 * @example
 * bytesToHex(sha3(textToBytes("abc"))) => "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"
 * @example
 * bytesToHex(sha3((new Array(136)).fill(1))) => "b36dc2167c4d9dda1a58b87046c8d76a6359afe3612c4de8a38857e09117b2db"
 * @example
 * bytesToHex(sha3((new Array(135)).fill(2))) => "5bdf5d815d29a9d7161c66520efc17c2edd7898f2b99a029e8d2e4ff153407f4"
 * @example
 * bytesToHex(sha3((new Array(134)).fill(3))) => "8e6575663dfb75a88f94a32c5b363c410278b65020734560d968aadd6896a621"
 * @example
 * bytesToHex(sha3((new Array(137)).fill(4))) => "f10b39c3e455006aa42120b9751faa0f35c821211c9d086beb28bf3c4134c6c6"
 */
export function sha3(bytes: byte[]): byte[]
{
    /**
     * @type {number} - state width (1600 bits, )
     */
    const WIDTH: number = 200;

    /**
     * @type {number} - rate (1088 bits, 136 bytes)
     */
    const RATE: number = 136;

    /**
     * @type {number} - capacity
     */
    const CAP: number = WIDTH - RATE;

    /**
     * Apply 1000...1 padding until size is multiple of r.
     * If already multiple of r then add a whole block of padding.
     * @param {number[]} src - list of uint8 numbers
     * @returns {number[]} - list of uint8 numbers
     */
    function pad(src: byte[]): byte[]
    {
        let dst = src.slice();

        let nZeroes: number = RATE - 2 - (dst.length%RATE);
        if (nZeroes < -1) {
            nZeroes += RATE - 2;
        }

        if (nZeroes == -1) {
            dst.push(0x86);
        } else {
            dst.push(0x06);

            for (let i = 0; i < nZeroes; i++) {
                dst.push(0);
            }

            dst.push(0x80);
        }

        JsRuntime.assert( (dst.length % RATE) === 0, "wrong digest length" );
        
        return dst;
    }

    /**
     * 24 numbers used in the sha3 permute function
     * @type {number[]}
     */
    const OFFSETS = [6, 12, 18, 24, 3, 9, 10, 16, 22, 1, 7, 13, 19, 20, 4, 5, 11, 17, 23, 2, 8, 14, 15, 21];

    /**
     * 24 numbers used in the sha3 permute function
     * @type {number[]}
     */
    const SHIFTS = [-12, -11, 21, 14, 28, 20, 3, -13, -29, 1, 6, 25, 8, 18, 27, -4, 10, 15, -24, -30, -23, -7, -9, 2];

    /**
     * Round constants used in the sha3 permute function
     * @type {uint64[]} 
     */
    const RC = [
        uint64( "0x0000000000000001" ) , 
        uint64( "0x0000000000008082" ) , 
        uint64( "0x800000000000808a" ) ,
        uint64( "0x8000000080008000" ) ,
        uint64( "0x000000000000808b" ) ,
        uint64( "0x0000000080000001" ) ,
        uint64( "0x8000000080008081" ) ,
        uint64( "0x8000000000008009" ) ,
        uint64( "0x000000000000008a" ) ,
        uint64( "0x0000000000000088" ) ,
        uint64( "0x0000000080008009" ) ,
        uint64( "0x000000008000000a" ) ,
        uint64( "0x000000008000808b" ) ,
        uint64( "0x800000000000008b" ) ,
        uint64( "0x8000000000008089" ) ,
        uint64( "0x8000000000008003" ) ,
        uint64( "0x8000000000008002" ) ,
        uint64( "0x8000000000000080" ) ,
        uint64( "0x000000000000800a" ) ,
        uint64( "0x800000008000000a" ) ,
        uint64( "0x8000000080008081" ) ,
        uint64( "0x8000000000008080" ) ,
        uint64( "0x0000000080000001" ) ,
        uint64( "0x8000000080008008" ) ,
    ];
    
    function permute(s: uint64[])
    {	
        let c: uint64[] = new Array(5);

        let b: uint64[] = new Array(25);
        
        for (let round = 0; round < 24; round++) {
            for (let i = 0; i < 5; i++) {
                c[i] = ((((s[i] ^ s[i+5]) ^ s[i+10]) ^ s[i+15]) ^ s[i+20]) as uint64;
            }

            for (let i = 0; i < 5; i++)
            {
                for (let j = 0; j < 5; j++)
                {
                    s[i+5*j] = (
                        s[i+5*j] ^
                        ( c[(i+4)%5] ^ uint64Rotr( c[(i+1)%5], 63 ) )
                    ) as uint64;
                }
            }

            b[0] = s[0];

            for(let i = 1; i < 25; i++) {
                let offset = OFFSETS[i-1];

                let left = Math.abs(SHIFTS[i-1]);
                let right = (32 - left) as uint6;

                if (SHIFTS[i-1] < 0) {
                    b[i] = uint64Rotr( s[offset], right );
                } else {
                    b[i] = uint64Rotr( s[offset], (right + 32) as uint6 );
                }
            }

            for (let i = 0; i < 5; i++)
            {
                for (let j = 0; j < 5; j++)
                {
                    s[i*5+j] = (b[i*5+j] ^ ( (~b[i*5 + (j+1)%5]) & b[i*5 + (j+2)%5]) ) as uint64;
                }
            }

            s[0] = (s[0] ^ RC[round]) as uint64;
        }
    }

    bytes = pad(bytes);

    // initialize the state
    /**
     * @type {uint64[]}
     */
    let state: uint64[] = (new Array(WIDTH/8)).fill( uint64( 0 ) );

    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += RATE) {
        // extend the chunk to become length WIDTH
        let chunk = bytes.slice(chunkStart, chunkStart + RATE).concat((new Array(CAP)).fill(0));

        // element-wise xor with 'state'
        for (let i = 0; i < WIDTH; i += 8) {
            state[i/8] = ( state[i/8] ^ uint64( "0x" + byteArrToHex(chunk.slice(i, i+8) ) ) ) as uint64;

            // beware: a uint32 is stored as little endian, but a pair of uint32s that form a uin64 are stored in big endian format!
            //state[i/4] ^= (chunk[i] << 0) | (chunk[i+1] << 8) | (chunk[i+2] << 16) | (chunk[i+3] << 24);
        }

        // apply block permutations
        permute(state);
    }

    const hash: byte[] = [];
    for (let i = 0; i < 4; i++) {
        hash.push( ...uint64ToBytesLE( state[i] ) );
    }

    return hash;
}

/**
 * getulates blake2-256 (32 bytes) hash of a list of uint8 numbers.
 * Result is also a list of uint8 number.
 * Blake2b is a 64bit algorithm, so we need to be careful when replicating 64-bit operations with 2 32-bit numbers (low-word overflow must spill into high-word, and shifts must go over low/high boundary)
 * @example                                        
 * bytesToHex(blake2b([0, 1])) => "01cf79da4945c370c68b265ef70641aaa65eaa8f5953e3900d97724c2c5aa095"
 * @example
 * bytesToHex(blake2b(textToBytes("abc"), 64)) => "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923"
 */
export function blake2b(bytes: byte[], digestSize : 32 | 64 = 32 ): byte[]
{
    /**
     * 128 bytes (16*8 byte words)
     */
    const WIDTH: number = 128;

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

    function pad(src: byte[]): byte[] {
        let dst = src.slice();

        let nZeroes = dst.length == 0 ? WIDTH : (WIDTH - dst.length%WIDTH)%WIDTH;

        // just padding with zeroes, the actual message length is used during compression stage of final block in order to uniquely hash messages of different lengths
        for (let i = 0; i < nZeroes; i++) {
            dst.push(0);
        }
        
        return dst;
    }

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
    function mix(v: uint64[], chunk: uint64[], a: number, b: number, c: number, d: number, i: number, j: number) {
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

    function compress(h: uint64[], chunk: uint64[], t: number, last: boolean) {
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

    const nBytes = bytes.length;

    bytes = pad(bytes);

    // init hash vector
    let h = IV.slice();
    
    // setup the param block
    const paramBlock = new Uint8Array(64);
    paramBlock[0] = digestSize; // n output  bytes
    paramBlock[1] = 0; // key-length (always zero in our case) 
    paramBlock[2] = 1; // fanout
    paramBlock[3] = 1; // depth

    //mix in the parameter block
    let paramBlockView = new DataView(paramBlock.buffer);
    ;
    for (let i = 0; i < 8; i++)
    {
        h[i] = (h[i] ^ paramBlockView.getBigUint64(i*8,true)) as uint64;
    }
    
    // loop all chunks
    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += WIDTH) {
        let chunkEnd = chunkStart + WIDTH; // exclusive
        let chunk = bytes.slice(chunkStart, chunkStart + WIDTH);

        let chunk64 = new Array(WIDTH/8);
        for (let i = 0; i < WIDTH; i += 8) {
            chunk64[i/8] = uint64( "0x" + byteArrToHex( chunk.slice(i, i+8) ) );
        }
        
        if (chunkStart == bytes.length - WIDTH) {
            // last block
            compress(h, chunk64, nBytes, true);
        } else {
            compress(h, chunk64, chunkEnd, false);
        }
    }

    // extract lowest BLAKE2B_DIGEST_SIZE (32 or 64) bytes from h

    const hash: byte[] = [];
    for (let i = 0; i < (digestSize / 8); i++)
    {
        hash.push( ...uint64ToBytesLE(h[i]) );
    }

    return hash.slice(0, digestSize);
}

/**
 * Ed25519 exports the following functions:
 *  * Ed25519.derivePublicKey(privateKey)
 *  * Ed25519.sign(message, privateKey)
 *  * Ed25519.verify(message, signature, publicKey)
 * 
 * This is implementation is slow (~0.5s per verification), but should be good enough for simple client-side usage
 * 
 * Ported from: https://ed25519.cr.yp.to/python/ed25519.py
 */
export function getEd25519() {
    const Q = BigInt( "57896044618658097711785492504343953926634992332820282019728792003956564819949" ); // ipowi(255) - 19
    const Q38 = BigInt( "7237005577332262213973186563042994240829374041602535252466099000494570602494" ); // (Q + 3)/8
    const CURVE_ORDER = BigInt( "7237005577332262213973186563042994240857116359379907606001950938285454250989" ); // ipow2(252) + 27742317777372353535851937790883648493;
    const D = -BigInt( "4513249062541557337682894930092624173785641285191125241628941591882900924598840740" ); // -121665 * invert(121666);
    const I = BigInt( "19681161376707505956807079304988542015446066515923890162744021073123829784752" ); // expMod(BigInt( 2 ), (Q - BigInt( 1 ))/4, Q);
    
    const BASE: bigpoint = [
        BigInt( "15112221349535400772501151409588531511454012693041857206046113283949847762202" ), // recoverX(B[1]) % Q
        BigInt( "46316835694926478169428394003475163141307993866256225615783033603165251855960" ) // (4*invert(5)) % Q
    ];

    /**
     * 
     * @param {bigint} b 
     * @param {bigint} e 
     * @param {bigint} m 
     * @returns {bigint}
     */
    function expMod(b: bigint, e: bigint, m: bigint): bigint
    {
        if (e == BigInt( 0 )) {
            return BigInt( 1 );
        } else {
            let t = expMod(b, e/BigInt( 2 ), m);
            t = (t*t) % m;

            if ((e % BigInt( 2 )) != BigInt( 0 )) {
                t = positiveMod(t*b, m)
            }

            return t;
        }
    }

    function invert(n: bigint): bigint {
        let a = positiveMod(n, Q);
        let b = Q;

        let x = BigInt( 0 );
        let y = BigInt( 1 );
        let u = BigInt( 1 );
        let v = BigInt( 0 );

        while (a !== BigInt( 0 )) {
            const q = b / a;
            const r = b % a;
            const m = x - u*q;
            const n = y - v*q;
            b = a;
            a = r;
            x = u;
            y = v;
            u = m;
            v = n;
        }

        return positiveMod(x, Q)
    }

    /**
     * @param {bigint} y 
     * @returns {bigint}
     */
    function recoverX( y: bigint ): bigint
    {
        const yy = y*y;
        const xx = (yy - BigInt( 1 )) * invert(D*yy + BigInt( 1 ));
        let x = expMod(xx, Q38, Q);

        if (((x*x - xx) % Q) !== BigInt( 0 )) {
            x = (x*I) % Q;
        }

        if (( x % BigInt( 2 ) ) !== BigInt( 0 )) {
            x = Q - x;
        }

        return x;
    }		

    type bigpoint = [bigint,bigint];
    /**
     * Curve point 'addition'
     * Note: this is probably the bottleneck of this Ed25519 implementation
     */
    function edwards(a: bigpoint, b: bigpoint): bigpoint
    {
        const x1 = a[0];
        const y1 = a[1];
        const x2 = b[0];
        const y2 = b[1];
        const dxxyy = D*x1*x2*y1*y2;
        const x3 = (x1*y2+x2*y1) * invert(BigInt( 1 )+dxxyy);
        const y3 = (y1*y2+x1*x2) * invert(BigInt( 1 )-dxxyy);
        return [positiveMod(x3, Q), positiveMod(y3, Q)];
    }

    function scalarMul(point: bigpoint, n: bigint): bigpoint
    {
        if (n === BigInt( 0 )) {
            return [BigInt( 0 ), BigInt( 1 )];
        } else {
            let sum = scalarMul(point, n/BigInt( 2 ));
            sum = edwards(sum, sum);
            if ((n % BigInt( 2 )) !== BigInt( 0 )) {
                sum = edwards(sum, point);
            }

            return sum;
        }
    }

    /**
     * Curve point 'multiplication'
     */
    function encodeInt(y: bigint): byte[] {
        let bytes = Array.from( BigIntUtils.toBuffer(y) ).reverse() as byte[];
        
        while (bytes.length < 32)
        {
            bytes.push(0);
        }

        return bytes;
    }

    function decodeInt(s: byte[]): bigint {
        return BigInt(
            "0x" + byteArrToHex( s.reverse() )
        );
    }

    function encodePoint(point: bigpoint): byte[] {
        const [x, y] = point;

        let bytes = encodeInt(y);

        // last bit is determined by x
        bytes[31] = ((bytes[31] & 0b011111111) | (Number(x & BigInt( 1 )) * 0b10000000)) as byte;

        return bytes;
    }

    function getBit(bytes: byte[], i: number): 0 | 1
    {
        return ((bytes[Math.floor(i/8)] >> i%8) & 1) as  0 | 1
    }

    function isOnCurve(point: bigpoint): boolean
    {
        const x = point[0];
        const y = point[1];
        const xx = x*x;
        const yy = y*y;
        return (-xx + yy - BigInt( 1 ) - D*xx*yy) % Q == BigInt( 0 );
    }

    function decodePoint(s: byte[])
    {
        JsRuntime.assert(s.length == 32, "point must have length of 32");

        const bytes = s.slice();
        bytes[31] = (bytes[31] & 0b01111111) as byte;

        const y = decodeInt(bytes);

        let x = recoverX(y);
        if (Number(x & BigInt( 1 )) != getBit(s, 255)) {
            x = Q - x;
        }

        const point: bigpoint = [x, y];

        if (!isOnCurve(point)) {
            throw new BasePlutsError("point isn't on curve");
        }

        return point;
    }

    function getA(h: byte[]): bigint
    {
        const a = BigInt( "28948022309329048855892746252171976963317496166410141009864396001978282409984" ); // ipow2(253)

        const bytes = h.slice(0, 32);
        bytes[0]  = (bytes[ 0  ] & 0b11111000) as byte;
        bytes[31] = (bytes[ 31 ] & 0b00111111) as byte;

        return a + BigInt( 
            "0x" + byteArrToHex( bytes.reverse() )
        );
    }

    function ihash(m: byte[] ): bigint
    {
        const h = sha2_512(m);

        return decodeInt(h);
    }

    return {
        derivePublicKey: function(privateKey: byte[]): byte[]
        {
            const privateKeyHash = sha2_512(privateKey);
            const a = getA(privateKeyHash);
            const A = scalarMul(BASE, a);

            return encodePoint(A);
        },

        sign: function(message: byte[], privateKey: byte[]): byte[]
        {
            const privateKeyHash = sha2_512(privateKey);
            const a = getA(privateKeyHash);

            // for convenience getulate publicKey here:
            const publicKey = encodePoint(scalarMul(BASE, a));

            const r = ihash(privateKeyHash.slice(32, 64).concat(message));
            const R = scalarMul(BASE, r);
            const S = positiveMod(r + ihash(encodePoint(R).concat(publicKey).concat(message))*a, CURVE_ORDER);

            return encodePoint(R).concat(encodeInt(S));
        },

        verify: function(signature: byte[], message: byte[], publicKey: byte[]): boolean
        {
            if (signature.length !== 64 || publicKey.length != 32)
            {
                throw new BasePlutsError(`unexpected signature length ${signature.length}`);
            }

            const R = decodePoint(signature.slice(0, 32));
            const A = decodePoint(publicKey);
            const S = decodeInt(signature.slice(32, 64));
            const h = ihash(signature.slice(0, 32).concat(publicKey).concat(message));

            const left = scalarMul(BASE, S);
            const right = edwards(R, scalarMul(A, h));

            return (left[0] == right[0]) && (left[1] == right[1]);
        }
    }
}