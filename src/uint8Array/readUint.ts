import { asserValidOffset, assertNum, assertInBound } from "./_asserts";

export const readUint8 = readUInt8;
export function readUInt8( buff: Uint8Array, offset: number, noAssert: boolean = false )
{
    offset = offset >>> 0
    if(! noAssert ) asserValidOffset( offset, 1, buff.length)
    return buff[offset]
}

export const readUint16LE = readUInt16LE;
export function readUInt16LE ( buff: Uint8Array, offset: number, noAssert: boolean = false ) {
    offset = offset >>> 0
    if (! noAssert ) asserValidOffset( offset, 2, buff.length)
    return buff[offset] | (buff[offset + 1] << 8)
}

export const readUint16BE = readUInt16BE;
export function readUInt16BE( buff: Uint8Array, offset: number, noAssert: boolean = false )
{
    offset = offset >>> 0
    if (! noAssert ) asserValidOffset( offset, 2, buff.length)
    return (buff[offset] << 8) | buff[offset + 1]
}

export const readUint32LE = readUInt32LE;
export function readUInt32LE( buff: Uint8Array, offset: number, noAssert: boolean = false ) {
    offset = offset >>> 0
    if (! noAssert ) asserValidOffset( offset, 4, buff.length)

    return ((buff[offset]) |
        (buff[offset + 1] << 8) |
        (buff[offset + 2] << 16)) +
        (buff[offset + 3] * 0x1000000)
}

export const readUint32BE = readUInt32BE;
export function readUInt32BE( buff: Uint8Array, offset: number, noAssert: boolean = false ) {
    offset = offset >>> 0
    if (! noAssert ) asserValidOffset( offset, 4, buff.length)

    return (buff[offset] * 0x1000000) +
        ((buff[offset + 1] << 16) |
        (buff[offset + 2] << 8) |
        buff[offset + 3])
}

export function readBigUInt64LE( buff: Uint8Array, offset: number ) {
    offset = offset >>> 0
    assertNum( offset )
    const first = buff[offset]
    const last = buff[offset + 7]
    if (first === undefined || last === undefined) {
        assertInBound( offset, buff.length - 8)
    }

    const lo = first +
        buff[++offset] * 2 ** 8 +
        buff[++offset] * 2 ** 16 +
        buff[++offset] * 2 ** 24

    const hi = buff[++offset] +
        buff[++offset] * 2 ** 8 +
        buff[++offset] * 2 ** 16 +
        last * 2 ** 24

    return BigInt(lo) + (BigInt(hi) << BigInt(32))
}

export function readBigUInt64BE( buff: Uint8Array, offset: number ) {
    offset = offset >>> 0
    assertNum( offset )
    const first = buff[offset]
    const last = buff[offset + 7]
    if (first === undefined || last === undefined) {
        assertInBound( offset, buff.length - 8)
    }

    const hi = first * 2 ** 24 +
        buff[++offset] * 2 ** 16 +
        buff[++offset] * 2 ** 8 +
        buff[++offset]

    const lo = buff[++offset] * 2 ** 24 +
        buff[++offset] * 2 ** 16 +
        buff[++offset] * 2 ** 8 +
        last

    return (BigInt(hi) << BigInt(32)) + BigInt(lo)
}

export function readIntLE( buff: Uint8Array, offset: number, byteLength: number, noAssert: boolean = false ) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (! noAssert ) asserValidOffset( offset,  byteLength, buff.length)

    let val = buff[offset]
    let mul = 1
    let i = 0
    while (++i < byteLength && (mul *= 0x100)) {
        val += buff[offset + i] * mul
    }
    mul *= 0x80

    if (val >= mul) val -= Math.pow(2, 8 * byteLength)

    return val
}

export function readFloat32BE( buf: Uint8Array, offset: number )
{
    const buff = new ArrayBuffer(4);
    const asFloat32 = new Float32Array(buff);
    const asUint8 = new Uint8Array(buff);
    for( let i = offset; i < offset + 4; i++ )
    {
        asUint8[i-offset] = buf[i];
    }
    return asFloat32[0];
}

export function readFloat64BE( buf: Uint8Array, offset: number )
{
    const buff = new ArrayBuffer(8);
    const asFloat64 = new Float64Array(buff);
    const asUint8 = new Uint8Array(buff);
    for( let i = offset; i < offset + 8; i++ )
    {
        asUint8[i-offset] = buf[i];
    }
    return asFloat64[0];
}