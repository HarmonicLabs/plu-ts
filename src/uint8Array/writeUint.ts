import { checkBounds } from "./_asserts";
import * as errors from "./errors";


function checkInt( buf: Uint8Array, value: number, offset: number, ext: number, max: number, min: number )
{
    if( !( buf instanceof Uint8Array )) throw new TypeError('"buffer" argument must be an Uint8Array instance')
    if( value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if(offset + ext > buf.length) throw new RangeError('Index out of range')
}

function checkIntBI(
    value: number | bigint, 
    min: number | bigint, 
    max: number | bigint, 
    buf: Uint8Array, 
    offset: number, 
    byteLength: number 
)
{
    if (value > max || value < min) {
        const n = typeof min === 'bigint' ? 'n' : ''
        let range
        if (byteLength > 3) {
            if (min === 0 || min === BigInt(0)) {
                range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`
            } else {
                range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
                        `${(byteLength + 1) * 8 - 1}${n}`
                }
        } else {
            range = `>= ${min}${n} and <= ${max}${n}`
        }
        throw new errors.ERR_OUT_OF_RANGE('value', range, value)
    }
    checkBounds(buf, offset, byteLength)
}

export const writeUintLE = writeUIntLE;
export function writeUIntLE( buff: Uint8Array, value: number, offset: number, byteLength: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if( !noAssert)
{
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt( buff, value, offset, byteLength, maxBytes, 0)
    }

    let mul = 1
    let i = 0
    buff[offset] = value & 0xFF
    while(++i < byteLength &&(mul *= 0x100))
{
    buff[offset + i] =( value / mul) & 0xFF
    }

    return offset + byteLength
}

export const writeUintBE = writeUIntBE;
export function writeUIntBE( buff: Uint8Array,value: number, offset: number, byteLength: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if( !noAssert)
{
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt( buff, value, offset, byteLength, maxBytes, 0)
    }

    let i = byteLength - 1
    let mul = 1
    buff[offset + i] = value & 0xFF
    while(--i >= 0 &&(mul *= 0x100))
{
    buff[offset + i] =( value / mul) & 0xFF
    }

    return offset + byteLength
}

export const writeUint8 = writeUInt8;
export function writeUInt8( buff: Uint8Array, value: number, offset: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    if( !noAssert) checkInt( buff, value, offset, 1, 0xff, 0)
    buff[offset] =( value & 0xff)
    return offset + 1
}

export const writeUint16LE = writeUInt16LE;
export function writeUInt16LE( buff: Uint8Array, value: number, offset: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    if( !noAssert) checkInt( buff, value, offset, 2, 0xffff, 0)
    buff[offset] =( value & 0xff)
    buff[offset + 1] =( value >>> 8)
    return offset + 2
}

export const writeUint16BE = writeUInt16BE;
export function writeUInt16BE( buff: Uint8Array, value: number, offset: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    if( !noAssert) checkInt( buff, value, offset, 2, 0xffff, 0)
    buff[offset] =( value >>> 8)
    buff[offset + 1] =( value & 0xff)
    return offset + 2
}

export const writeUint32LE = writeUInt32LE;
export function writeUInt32LE( buff: Uint8Array, value: number, offset: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    if( !noAssert) checkInt( buff, value, offset, 4, 0xffffffff, 0)
    buff[offset + 3] =( value >>> 24)
    buff[offset + 2] =( value >>> 16)
    buff[offset + 1] =( value >>> 8)
    buff[offset] =( value & 0xff)
    return offset + 4
}

export const writeUint32BE = writeUInt32BE;
export function writeUInt32BE( buff: Uint8Array, value: number, offset: number, noAssert: boolean = false )
{
    value = +value
    offset = offset >>> 0
    if( !noAssert) checkInt( buff, value, offset, 4, 0xffffffff, 0)
    buff[offset] =( value >>> 24)
    buff[offset + 1] =( value >>> 16)
    buff[offset + 2] =( value >>> 8)
    buff[offset + 3] =( value & 0xff)
    return offset + 4
}

export function writeBigUInt64LE( buf: Uint8Array, value: bigint, offset: number )
{
    const min = BigInt(0);
    const max = BigInt('0xffffffffffffffff');

    checkIntBI( value, min, max, buf, offset, 7)

    let lo = Number( value & BigInt(0xffffffff))
    buf[offset++] = lo
    lo = lo >> 8
    buf[offset++] = lo
    lo = lo >> 8
    buf[offset++] = lo
    lo = lo >> 8
    buf[offset++] = lo
    let hi = Number( value >> BigInt(32) & BigInt(0xffffffff))
    buf[offset++] = hi
    hi = hi >> 8
    buf[offset++] = hi
    hi = hi >> 8
    buf[offset++] = hi
    hi = hi >> 8
    buf[offset++] = hi
    return offset
}

export function writeBigUInt64BE( buf: Uint8Array, value: bigint, offset: number )
{
    const min = BigInt(0);
    const max = BigInt('0xffffffffffffffff');

    checkIntBI( value, min, max, buf, offset, 7)

    let lo = Number( value & BigInt(0xffffffff) )
    buf[offset + 7] = lo
    lo = lo >> 8
    buf[offset + 6] = lo
    lo = lo >> 8
    buf[offset + 5] = lo
    lo = lo >> 8
    buf[offset + 4] = lo
    let hi = Number( value >> BigInt(32) & BigInt(0xffffffff) )
    buf[offset + 3] = hi
    hi = hi >> 8
    buf[offset + 2] = hi
    hi = hi >> 8
    buf[offset + 1] = hi
    hi = hi >> 8
    buf[offset] = hi
    return offset + 8
}

export function writeFloat64BE( buf: Uint8Array, value: number, offset: number )
{
    const buff = new ArrayBuffer(8);
    const asFloatArr = new Float64Array(buff);
    asFloatArr[0] = value;
    const asUint8 = new Uint8Array(buff);
    for( let i = 0; i < 8; i++ )
    {
        buf[offset + i] = asUint8[i];
    }
    return offset + 8;
}