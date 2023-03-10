import { byte, uint64 as uint64_t, uint6, buffToByteArr } from "./types";
import JsRuntime from "../utils/JsRuntime";
import { uint64, uint64Rotr, byteArrToHex, uint64ToBytesLE } from "./types";
import { isUint8Array } from "@harmoniclabs/uint8array-utils";


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
export function sha3(bytes: byte[] | Uint8Array): byte[]
{
    if( isUint8Array( bytes ) )
    {
        bytes = buffToByteArr( bytes );
    }
    /**
     * state width (1600 bits, )
     */
    const WIDTH: number = 200;

    /**
     * rate (1088 bits, 136 bytes)
     */
    const RATE: number = 136;

    /**
     * capacity
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

        JsRuntime.assert( (dst.length % RATE) === 0, "wrong destination length" );
        
        return dst;
    }

    /**
     * 24 numbers used in the sha3 permute function
     */
    const OFFSETS = Object.freeze([6, 12, 18, 24, 3, 9, 10, 16, 22, 1, 7, 13, 19, 20, 4, 5, 11, 17, 23, 2, 8, 14, 15, 21]);

    /**
     * 24 numbers used in the sha3 permute function
     */
    const SHIFTS = Object.freeze([-12, -11, 21, 14, 28, 20, 3, -13, -29, 1, 6, 25, 8, 18, 27, -4, 10, 15, -24, -30, -23, -7, -9, 2]);

    /**
     * Round constants used in the sha3 permute function
     */
    const RC = Object.freeze([
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
    ]);
    
    function permute(s: uint64_t[]): void
    {	
        const c: uint64_t[] = new Array(5);
        const b: uint64_t[] = new Array(25);
        
        for (let round = 0; round < 24; round++)
        {
            for (let i = 0; i < 5; i++)
            {
                c[i] = uint64((((s[i] ^ s[i+5]) ^ s[i+10]) ^ s[i+15]) ^ s[i+20]);
            }

            for (let i = 0; i < 5; i++)
            {
                const tmp = uint64( c[ (i+4) % 5 ] ^ uint64Rotr( c[ (i+1) % 5 ], 63 ) );

                for (let j = 0; j < 5; j++)
                {
                    s[i+5*j] = uint64( s[i+5*j] ^ tmp );
                }
            }

            b[0] = s[0];

            for(let i = 1; i < 25; i++)
            {
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
                    s[i*5+j] = uint64( b[i*5+j] ^ ( (~b[i*5 + (j+1)%5]) & b[i*5 + (j+2)%5]) );
                }
            }

            s[0] = (s[0] ^ RC[round]) as uint64;
        }
    }

    bytes = pad(bytes);

    // initialize the state
    let state: uint64_t[] = (new Array(WIDTH/8)).fill( uint64( 0 ) );

    for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += RATE)
    {
        // extend the chunk to become length WIDTH
        let chunk = bytes.slice(chunkStart, chunkStart + RATE).concat((new Array(CAP)).fill(0));

        // element-wise xor with 'state'
        for (let i = 0; i < WIDTH; i += 8)
        {
            state[i/8] = uint64(
                state[i/8] ^
                uint64( "0x" + byteArrToHex( chunk.slice(i, i+8).reverse() ) )
            );

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
