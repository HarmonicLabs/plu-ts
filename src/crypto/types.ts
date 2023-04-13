import { BasePlutsError } from "../errors/BasePlutsError";
import { isUint8Array } from "@harmoniclabs/uint8array-utils";
import JsRuntime from "../utils/JsRuntime";

export type uint5 = 
    0  | 1  | 2  | 3  | 4  | 5  | 6  | 7  |
    8  | 9  | 10 | 11 | 12 | 13 | 14 | 15 |
    16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
    24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 ;

export function isUint5( n: number ): n is uint6
{
    return (
        typeof n === "number" &&
        n >= 0 && n <= 31 &&
        n === Math.round( n )
    );
}

export type uint6 = uint5 |
    32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 |
    40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 |
    48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 |
    56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 ;

export function isUint6( n: number ): n is uint6
{
    return (
        typeof n === "number" &&
        n >= 0 && n <= 63 &&
        n === Math.round( n )
    );
}

export  type byte = 0  |
    1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
    11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  | 20  |
    21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  | 30  |
    31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  | 40  |
    41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  | 50  |
    51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  | 60  |
    61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  | 70  |
    71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  | 80  |
    81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  | 90  |
    91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  | 100 |
    101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 |
    111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 |
    121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 |
    131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 |
    141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 |
    151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 |
    161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 |
    171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 |
    181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 |
    191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 |
    201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 |
    211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 |
    221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 |
    231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 |
    241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 |
    251 | 252 | 253 | 254 | 255 ;

export function byte( bint: bigint | number ): byte
{
    return (Number( bint ) & 0xff) as any;
}

export function isByte( n: number ): n is byte
{
    return (
        typeof n === "number" &&
        n >= 0 && n <= 0b1111_1111 &&
        n === Math.round( n )
    );
}

export function isByteArr( something: any ): something is byte[]
{
    return (
        Array.isArray( something ) &&
        something.every( isByte )
    );
}

export function buffToByteArr( buff: Uint8Array ): byte[]
{
    if( !isUint8Array( buff ) )
    {
        if( isByteArr( buff ) ) return (buff as byte[]).slice();

        throw new BasePlutsError(
            "can't convert non-buffer to byte array"
        );
    }
    return Array.from( buff ) as any;
}

export function byteArrToHex( bytes: byte[] ): string
{
    return bytes.reduce( (acc, val) => acc + val.toString(16).slice(0,2).padStart(2,'0') , '' )
}

export function byteArrToBin( bytes: byte[] ): string
{
    return bytes.reduce( (acc, val) => acc + val.toString(2).slice(0,8).padStart(8,'0') , '' );
}

/**
 * Internal method
 * 
 * `bytes` is **padded at the end** to be a multiple of 5
 */
export function buffToUint5Arr( bytes: Uint8Array | byte[] ): uint5[]
{
    const result: uint5[] = [];

    let bits: string | ('0'|'1')[] =
        isUint8Array( bytes ) ?
            Array.from<number>( bytes ).reduce( (acc, n) => acc + n.toString(2).padStart( 8 , '0' ), "" ) :
            (isByteArr( bytes ) ?
                byteArrToBin( bytes ) :
                undefined as any
            );

    if( bits === undefined )
    {
        throw new BasePlutsError(
            "invalid input to convert ot uint5 array"
        );
    }

    const mod5Len = bits.length % 5;
    if( mod5Len !== 0 )
    {
        bits = (bits as string).padEnd( bits.length + ( 5 - mod5Len ) ,'0');
    }

    bits = (bits as string).split('') as ('0'|'1')[];

    for( let i = 0; i < bits.length; )
    {
        result.push(
            Number( `0b${bits[i++]}${bits[i++]}${bits[i++]}${bits[i++]}${bits[i++]}` ) as uint5
        );
    }
    
    return result;
}

export  type uint64 = bigint & { __uint64__: never };

export function uint64( n: string | number | bigint | boolean ): uint64
{
    const _n = BigInt( n );
    if( !isUint64(_n) )
    throw new BasePlutsError("can't convert " + n + " to uint64");
    
    return _n;
}

export function forceUint64( n: string | number | bigint | boolean ): uint64
{
    return (BigInt( n ) & BigInt( "0x" + "ff".repeat(8) )) as uint64;
}

export function isUint64( n: bigint ): n is uint64
{
    return (
        typeof n === "bigint" &&
        n >= BigInt( 0 ) &&
        n < BigInt( "0x1" + "00".repeat(8) ) // n < (1 << 64)
    )
}

export function uint64ToBytesLE( uint: uint64 ): [ byte, byte, byte, byte, byte, byte, byte, byte ]
{
    return [
        byte(  BigInt( "0x00000000000000ff" ) & uint),
        byte( (BigInt( "0x000000000000ff00" ) & uint) >> BigInt( 8  ) ),
        byte( (BigInt( "0x0000000000ff0000" ) & uint) >> BigInt( 16 ) ),
        byte( (BigInt( "0x00000000ff000000" ) & uint) >> BigInt( 24 ) ),
        byte( (BigInt( "0x000000ff00000000" ) & uint) >> BigInt( 32 ) ),
        byte( (BigInt( "0x0000ff0000000000" ) & uint) >> BigInt( 40 ) ),
        byte( (BigInt( "0x00ff000000000000" ) & uint) >> BigInt( 48 ) ),
        byte( (BigInt( "0xff00000000000000" ) & uint) >> BigInt( 56 ) ),
    ];
}

export function uint64ToBytesBE( uint: uint64 ): [ byte, byte, byte, byte, byte, byte, byte, byte ]
{
    return uint64ToBytesLE( uint ).reverse() as any;
}

export function uint64Rotr( a: uint64, b: uint6 ): uint64
{
    JsRuntime.assert(
        isUint64( a ) && isUint6( b ),
        "invalid args for 'uint64And'"
    );
    
    if( b === 0 ) return a;
    const n = BigInt(b);
    return forceUint64(
        forceUint64(a >> n) | forceUint64(a << ( BigInt(64) - n ))
    );
}

