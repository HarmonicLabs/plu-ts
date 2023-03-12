
import { fromHex, readBigUInt64BE, readUint32BE, toHex, writeBigUInt64BE } from "@harmoniclabs/uint8array-utils";

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

function read_int(int: Uint8Array): Uint8Array
{
    const x = new Uint8Array(8);
    for(let i = 0; i < int.length; i++)
    {
        x[i+(8-int.length)] = int[i];
    }

    return x;
}

export function seahash_ref( 
    data: Uint8Array, 
    k1: Uint8Array = uint64("0x16f11fe89b0d677c"),
    k2: Uint8Array = uint64("0xb480a793d8e6c86c"),
    k3: Uint8Array = uint64("0x6fe2e5aaf078ebc9"),
    k4: Uint8Array = uint64("0x14f994a4c5259381")
)
{
    function write_u64( u64: Uint8Array )
    {
        let a = diffuse( xor( k1, u64 ) );

        k1 = k2;
        k2 = k3;
        k3 = k4;
        k4 = a;
    }

    let ptr = 0;

    while( ptr < data.length )
    {
        const chunk = read_int( data.subarray( ptr, ptr += 8 ) );
        console.log( ptr, toHex(chunk) ) 
        write_u64( chunk )
    }
    // finalize

    k1 = xor( k1, k2 );
    k3 = xor( k3, k4 );
    k1 = xor( k1, k3 );

    return diffuse( xor( k1, uint64( data.length ) ) );
}