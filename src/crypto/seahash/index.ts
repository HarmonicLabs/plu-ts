import { fromHex, readBigUInt64BE, readUint32BE, writeBigUInt64BE } from "@harmoniclabs/uint8array-utils";

function uint64( arg: string | bigint | number ): Uint8Array
{
    let arr: Uint8Array | undefined = undefined;

    if( typeof arg === "number" )
    {
        const buff = new ArrayBuffer(8);
        const arr = new Uint8Array( buff );
        const asInt32 = new Int32Array( buff )
        asInt32[1] = arg | 0;
        return arr;
    }
    else if( typeof arg === "string" )
    {
        if( arg[0] === '0' && arg[1] === 'x')
        {
            arg = arg.slice(2)
                .padStart( 16,'0' )
            arr = fromHex(
                arg.slice( arg.length - 16, arg.length )
            );
        }
        else return uint64( BigInt( arg ) )
    }
    else
    {
        arr = new Uint8Array(8);
        writeBigUInt64BE( arr, arg, 0 );
    }

    return arr;
}



const pow2_64 = BigInt( "0x10000000000000000" ); // MAX uint64 + 1

const hex6eed0e9da4d94a4f = uint64( "0x6eed0e9da4d94a4f" );

// 0x2f72b4215a3d8caf is the modular multiplicative inverse of the constant used in `diffuse`.
const hex2f72b4215a3d8caf = uint64( "0x2f72b4215a3d8caf" );

function wrapping_mul( a: Uint8Array, b: Uint8Array ): Uint8Array
{
    return uint64(
        (
            readBigUInt64BE(a, 0) * 
            readBigUInt64BE(b, 0)
        ) % pow2_64
    );
}

function xor( a: Uint8Array, b: Uint8Array ): Uint8Array
{
    return a.map( (n,i) => n ^ b[i] );
}

export function diffuse( x: Uint8Array ): Uint8Array
{
    x = wrapping_mul( x, hex6eed0e9da4d94a4f );
    x = xor(
        x,
        uint64(
            BigInt(
                readUint32BE( x, 0 ) >>> (x[0] >>> 4)
            )
        )
    );

    return wrapping_mul( x, hex6eed0e9da4d94a4f ); 
}

export function undiffuse( x: Uint8Array ): Uint8Array
{
    x = wrapping_mul( x, hex2f72b4215a3d8caf );
    x = xor(
        x,
        uint64(
            BigInt(
                readUint32BE( x, 0 ) >> (x[0] >> 4)
            )
        )
    );

    return wrapping_mul( x, hex2f72b4215a3d8caf ); 
}

/**
 * Read a buffer smaller than 8 bytes into an integer in little-endian.
 *
 * This assumes that `buf.len() < 8`. If this is not satisfied, the behavior is unspecified.
 */
function helper_read_int( buff: Uint8Array ): Uint8Array
{
    const result = new Uint8Array(8);
    for(let i = buff.length - 1; i >= 0; i--)
    {
        result[7-i] = buff[i]
    }
    return result;
}

function helper_read_u64( buff: Uint8Array, start: number): Uint8Array
{
    // `slice` clones
    return buff.slice( start, start + 8 ).reverse();
}

export function seahash( 
    data: Uint8Array, 
    k1: Uint8Array = uint64("0x16f11fe89b0d677c"),
    k2: Uint8Array = uint64("0xb480a793d8e6c86c"),
    k3: Uint8Array = uint64("0x6fe2e5aaf078ebc9"),
    k4: Uint8Array = uint64("0x14f994a4c5259381")
)
{   
    let ptr = 0;
    const len = data.length;
    const end = len - (len % 32);

    while( end > ptr )
    {
        k1 = diffuse(
            xor( k1, data.subarray( ptr, ptr += 8 ) )
        );
        k2 = diffuse(
            xor( k2, data.subarray( ptr, ptr += 8 ) )
        );
        k3 = diffuse(
            xor( k3, data.subarray( ptr, ptr += 8 ) )
        );
        k4 = diffuse(
            xor( k4, data.subarray( ptr, ptr += 8 ) )
        );
    }

    // https://github.com/redox-os/tfs/blob/facbfb6bb7999bfda79cd90bd83adc23daa14743/seahash/src/buffer.rs#L66
    let extra = len - end;
    if( extra <= 0 ){}
    else if( extra < 8 )
    {
        k1 = diffuse(
            xor( k1, helper_read_int( data.subarray( ptr, ptr + extra )) ) 
        );
    }
    else if( extra === 8 )
    {
        k1 = diffuse(
            xor( k1, helper_read_u64( data, ptr ) ) 
        );
    }
    else if( extra < 16 )
    {
        k1 = diffuse(
            xor( k1, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k2 = diffuse(
            xor( k2, helper_read_int( data.subarray( ptr, ptr + extra )) ) 
        );
    }
    else if( extra === 16 )
    {
        k1 = diffuse(
            xor( k1, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k2 = diffuse(
            xor( k2, helper_read_u64( data, ptr ) ) 
        );   
    }
    else if( extra < 24 )
    {
        k1 = diffuse(
            xor( k1, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k2 = diffuse(
            xor( k2, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k3 = diffuse(
            xor( k3, helper_read_int( data.subarray( ptr, ptr + extra )) ) 
        );
    }
    else if( extra === 24 )
    {
        k1 = diffuse(
            xor( k1, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k2 = diffuse(
            xor( k2, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k3 = diffuse(
            xor( k3, helper_read_u64( data, ptr ) ) 
        );
    }
    else
    {
        k1 = diffuse(
            xor( k1, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k2 = diffuse(
            xor( k2, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k3 = diffuse(
            xor( k3, helper_read_u64( data, ptr ) ) 
        );
        ptr += 8;
        extra -= 8;

        k4 = diffuse(
            xor( k4, helper_read_int( data.subarray( ptr, ptr + extra )) ) 
        );
    }

    // finalize

    k1 = xor( k1, k2 );
    k3 = xor( k3, k4 );
    k1 = xor( k1, k3 );

    return diffuse( xor( k1, uint64( data.length ) ) );
}