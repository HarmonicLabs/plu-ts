
export function toAscii( buf: Uint8Array, start: number = 0, end: number = Infinity )
{
    let ret = ''
    end = Math.min(buf.length, end)
  
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7f)
    }
    return ret
}

export function fromAscii( str: string ): Uint8Array
{
    const len = str.length;
    const byteArray = new Array( len )
    for (let i = 0; i < str.length; ++i) {
        byteArray[i] = str.charCodeAt(i) & 0xff;
    }
    return new Uint8Array( byteArray )
}