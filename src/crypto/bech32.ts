import JsRuntime from "../utils/JsRuntime";
import { byte, uint5, buffToUint5Arr } from "./types";
import { BECH32_BASE32_ALPHABET, decodeBase32Bech32 } from "./utils/base32";

/**
 * Expand human readable prefix of the bech32 encoding so it can be used in the checkSum
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


const BECH32_POLYMOD_GEN = Object.freeze([0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3] as const);

/**
 * Used as part of the bech32 checksum.
 */
export function getBech32Polymod(bytes: byte[]): number
{
    let checksum = 1;
    for (const byte of bytes) {
        let c = (checksum >> 25);
        checksum = (checksum & 0x1fffffff) << 5 ^ byte;

        for (let i = 0; i < 5; i++) {
            if (((c >> i) & 1) != 0) {
                checksum ^= BECH32_POLYMOD_GEN[i];
            }
        }
    }

    return checksum;
}

/**
 * Generate the bech32 checksum
 */
export function getBech32Checksum(humanReadablePart: string, data: uint5[]): [uint5,uint5,uint5,uint5,uint5,uint5]
{
    const checksum = getBech32Polymod(
        expandBech32HumanReadablePart( humanReadablePart )
        .concat(data)
        .concat([0,0,0,0,0,0])
    ) ^ 1;

    const chkSum = [];
    for (let i = 0; i < 6; i++) {
        chkSum.push((checksum >> 5 * (5 - i)) & 31);
    }

    return chkSum as any;
}

/**
 * Creates a bech32 checksummed string (used to represent Cardano addresses)
 * @example
 * encodeBech32("foo", textToBytes("foobar")) => "foo1vehk7cnpwgry9h96"
 * @example
 * encodeBech32("addr_test", hexToBytes("70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539")) => "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld"
 * @param {byte[]} data - uint8 0 - 256
 */
export function encodeBech32(humanReadablePart: string, data: byte[] | Buffer ): string
{
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

    let i = addr.indexOf("1");
    if (i == -1 || i == 0) {
        return false;
    }

    const hrp = addr.slice(0, i);

    addr = addr.slice(i + 1);

    const data: byte[] = [];

    for (let ch of addr) {
        let j = BECH32_BASE32_ALPHABET.indexOf(ch as any);
        if (j == -1) {
            return false;
        }

        data.push(j as byte);
    }

    const chkSumA = data.slice(data.length - 6);
    const chkSumB = getBech32Checksum(hrp, data.slice(0, data.length - 6) as any);

    for (let i = 0; i < 6; i++) {
        if (chkSumA[i] != chkSumB[i]) {
            return false;
        }
    }

    return true;
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