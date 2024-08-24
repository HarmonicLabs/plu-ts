
export function concatUint8Arr( ...arrs: (Uint8Array | Uint32Array)[] ): Uint8Array
{
    arrs = arrs .map( arr => arr instanceof Uint8Array ? arr : new Uint8Array( arr.buffer ) );
    
    const len = arrs.reduce( (acc, arr) => acc + arr.length, 0 );
    const res = new Uint8Array(len);

    let idx = 0;
    for(const arr of arrs)
    {
        res.set( arr, idx );
        idx += arr.length;
    }
    return res;
}