import { byte, uint64 } from "./types";

const pow2_64 = BigInt( "0x10000000000000000" );

const hex6eed0e9da4d94a4f = BigInt( "0x6eed0e9da4d94a4f" ) as uint64;

// 0x2f72b4215a3d8caf is the modular multiplicative inverse of the constant used in `diffuse`.
const hex2f72b4215a3d8caf = BigInt( "0x2f72b4215a3d8caf" ) as uint64;

const n32 = BigInt(32);
const n60 = BigInt(60);

function wrapping_mul( a: uint64, b: uint64 ): uint64
{
    return ((a * b) % pow2_64) as uint64;
}

export function diffuse( x: uint64 ): uint64
{
    x = wrapping_mul( x, hex6eed0e9da4d94a4f );
    x = (x ^ (( x >> n32 ) >> ( x >> n60 ))) as uint64;

    return wrapping_mul( x, hex6eed0e9da4d94a4f ); 
}

export function undiffuse( x: uint64 ): uint64
{
    x = wrapping_mul( x, hex2f72b4215a3d8caf );
    x = (x ^ (( x >> n32 ) >> ( x >> n60 ))) as uint64;

    return wrapping_mul( x, hex2f72b4215a3d8caf ); 
}

function seahash( 
    data: byte[], 
    k1: uint64 = uint64("0xe7b0c93ca8525013"),
    k2: uint64 = uint64("0x011d02b854ae8182"),
    k3: uint64 = uint64("0x7bcc5cf9c39cec76"),
    k4: uint64 = uint64("0xfa336285d102d083")
)
{
    let state = (k1 ^ k3) as uint64;
    let tmp: uint64;

    function writeUint64( n: uint64 ): void
    {
        tmp = diffuse( (k1 ^ n) as uint64 );

        k1 = k2;
        k2 = k3;
        k3 = k4;
        k4 = tmp;
    }
}