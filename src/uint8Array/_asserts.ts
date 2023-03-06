import * as errors from "./errors";

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
export function asserValidOffset( offset: number, ext: number, length: number ): void
{
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

export function assertNum( n: any ): void
{
    if( typeof n !== "number" )
    throw new Error("expected a number");
}

export function assertInBound( value: number, length: number, type?: string )
{
    if (Math.floor(value) !== value) {
        assertNum(value)
        throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
    }
  
    if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
    }
  
    throw new errors.ERR_OUT_OF_RANGE(
        type || 'offset',
        `>= ${type ? 1 : 0} and <= ${length}`,
        value
    )
}

export function checkBounds(
    buf: Uint8Array, 
    offset: number, 
    byteLength: number
)
{
    assertNum( offset )
    if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
        assertInBound( offset, buf.length - (byteLength + 1) )
    }
}