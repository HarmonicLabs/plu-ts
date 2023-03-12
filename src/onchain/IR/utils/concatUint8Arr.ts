
export function concatUint8Arr( ...arrs: Uint8Array[] ): Uint8Array
{
    const len = arrs.reduce( (acc, arr) => acc + arr.length, 0 );
    const res = new Uint8Array(len);
    const nArrs = arrs.length;
    let idx = 0;
    for(const arr of arrs)
    {
        for(const byte of arr)
        {
            res[idx++] = byte;
        }
    }
    return res;
}