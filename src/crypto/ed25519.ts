import { BasePlutsError } from "../errors/BasePlutsError";
import { isUint8Array } from "../uint8Array";
import BigIntUtils from "../utils/BigIntUtils";
import JsRuntime from "../utils/JsRuntime";
import { sha2_512 } from "./sha2_512";
import { buffToByteArr, byte, byteArrToHex } from "./types";
import { positiveMod } from "./utils/positiveMod";


type bigpoint = [bigint,bigint];

const Q = BigInt( "57896044618658097711785492504343953926634992332820282019728792003956564819949" ); // ipowi(255) - 19
const Q38 = BigInt( "7237005577332262213973186563042994240829374041602535252466099000494570602494" ); // (Q + 3)/8
const CURVE_ORDER = BigInt( "7237005577332262213973186563042994240857116359379907606001950938285454250989" ); // ipow2(252) + 27742317777372353535851937790883648493;
const D = -BigInt( "4513249062541557337682894930092624173785641285191125241628941591882900924598840740" ); // -121665 * invert(121666);
const I = BigInt( "19681161376707505956807079304988542015446066515923890162744021073123829784752" ); // expMod(BigInt( 2 ), (Q - BigInt( 1 ))/4, Q);

const BASE = Object.freeze([
    BigInt( "15112221349535400772501151409588531511454012693041857206046113283949847762202" ), // recoverX(B[1]) % Q
    BigInt( "46316835694926478169428394003475163141307993866256225615783033603165251855960" ) // (4*invert(5)) % Q
] as const);

/**
 * 
 * @param {bigint} b 
 * @param {bigint} e 
 * @param {bigint} m 
 * @returns {bigint}
 */
function expMod(b: bigint, e: bigint, m: bigint): bigint
{
    if (e == BigInt( 0 )) {
        return BigInt( 1 );
    } else {
        let t = expMod(b, e/BigInt( 2 ), m);
        t = (t*t) % m;

        if ((e % BigInt( 2 )) != BigInt( 0 )) {
            t = positiveMod(t*b, m)
        }

        return t;
    }
}

function invert(n: bigint): bigint {
    let a = positiveMod(n, Q);
    let b = Q;

    let x = BigInt( 0 );
    let y = BigInt( 1 );
    let u = BigInt( 1 );
    let v = BigInt( 0 );

    while (a !== BigInt( 0 )) {
        const q = b / a;
        const r = b % a;
        const m = x - u*q;
        const n = y - v*q;
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }

    return positiveMod(x, Q)
}

/**
 * @param {bigint} y 
 * @returns {bigint}
 */
function recoverX( y: bigint ): bigint
{
    const yy = y*y;
    const xx = (yy - BigInt( 1 )) * invert(D*yy + BigInt( 1 ));
    let x = expMod(xx, Q38, Q);

    if (((x*x - xx) % Q) !== BigInt( 0 )) {
        x = (x*I) % Q;
    }

    if (( x % BigInt( 2 ) ) !== BigInt( 0 )) {
        x = Q - x;
    }

    return x;
}		

/**
 * Curve point 'addition'
 * Note: this is probably the bottleneck of this Ed25519 implementation
 */
function edwards(a: Readonly<bigpoint>, b: Readonly<bigpoint>): bigpoint
{
    const x1 = a[0];
    const y1 = a[1];
    const x2 = b[0];
    const y2 = b[1];
    const dxxyy = D*x1*x2*y1*y2;
    const x3 = (x1*y2+x2*y1) * invert(BigInt( 1 )+dxxyy);
    const y3 = (y1*y2+x1*x2) * invert(BigInt( 1 )-dxxyy);
    return [positiveMod(x3, Q), positiveMod(y3, Q)];
}

function scalarMul(point: Readonly<bigpoint>, n: bigint): bigpoint
{
    if (n === BigInt( 0 )) {
        return [BigInt( 0 ), BigInt( 1 )];
    } else {
        let sum = scalarMul(point, n/BigInt( 2 ));
        sum = edwards(sum, sum);
        if ((n % BigInt( 2 )) !== BigInt( 0 )) {
            sum = edwards(sum, point);
        }

        return sum;
    }
}

/**
 * Curve point 'multiplication'
 */
function encodeInt(y: bigint): byte[] {
    let bytes = Array.from( BigIntUtils.toBuffer(y) ).reverse() as byte[];
    
    while (bytes.length < 32)
    {
        bytes.push(0);
    }

    return bytes;
}

function decodeInt(s: byte[]): bigint {
    return BigInt(
        "0x" + byteArrToHex( s.reverse() )
    );
}

function encodePoint(point: bigpoint): byte[] {
    const [x, y] = point;

    let bytes = encodeInt(y);

    // last bit is determined by x
    bytes[31] = ((bytes[31] & 0b011111111) | (Number(x & BigInt( 1 )) * 0b10000000)) as byte;

    return bytes;
}

function getBit(bytes: byte[], i: number): 0 | 1
{
    return ((bytes[Math.floor(i/8)] >> i%8) & 1) as  0 | 1
}

function isOnCurve(point: bigpoint): boolean
{
    const x = point[0];
    const y = point[1];
    const xx = x*x;
    const yy = y*y;
    return (-xx + yy - BigInt( 1 ) - D*xx*yy) % Q == BigInt( 0 );
}

function decodePoint(s: byte[])
{
    JsRuntime.assert(s.length == 32, "point must have length of 32");

    const bytes = s.slice();
    bytes[31] = (bytes[31] & 0b01111111) as byte;

    const y = decodeInt(bytes);

    let x = recoverX(y);
    if (Number(x & BigInt( 1 )) != getBit(s, 255)) {
        x = Q - x;
    }

    const point: bigpoint = [x, y];

    if (!isOnCurve(point)) {
        throw new BasePlutsError("point isn't on curve");
    }

    return point;
}

function getA(h: byte[]): bigint
{
    const a = BigInt( "28948022309329048855892746252171976963317496166410141009864396001978282409984" ); // ipow2(253)

    const bytes = h.slice(0, 32);
    bytes[0]  = (bytes[ 0  ] & 0b11111000) as byte;
    bytes[31] = (bytes[ 31 ] & 0b00111111) as byte;

    return a + BigInt( 
        "0x" + byteArrToHex( bytes.reverse() )
    );
}

function ihash( m: byte[] ): bigint
{
    return decodeInt( sha2_512(m) );
}


export function deriveEd25519PublicKey(privateKey: byte[]): byte[]
{
    const privateKeyHash = sha2_512(privateKey);
    const a = getA(privateKeyHash);
    const A = scalarMul(BASE, a);

    return encodePoint(A);
}

export function signEd25519( message: byte[] | Uint8Array, privateKey: byte[] | Uint8Array ): [ pubKey: byte[], signature: byte[] ]
{
    message = isUint8Array( message ) ? buffToByteArr( message ) : message;
    privateKey = isUint8Array( privateKey ) ? buffToByteArr( privateKey ) : privateKey;

    const privateKeyHash = sha2_512(privateKey);
    const a = getA(privateKeyHash);

    // for convenience getulate publicKey here:
    const publicKey = encodePoint(scalarMul(BASE, a));

    const r = ihash(privateKeyHash.slice(32, 64).concat(message));
    const R = scalarMul(BASE, r);
    const S = positiveMod(r + ihash(encodePoint(R).concat(publicKey).concat(message))*a, CURVE_ORDER);

    return [ publicKey, encodePoint(R).concat(encodeInt(S)) ];
}

export function getEd25519Signature( message: byte[] | Uint8Array, privateKey: byte[] | Uint8Array ): byte[]
{
    return signEd25519( message, privateKey )[1];
}

export function verifyEd25519Signature(signature: byte[] | Uint8Array, message: byte[] | Uint8Array, publicKey: byte[] | Uint8Array): boolean
{
    if (signature.length !== 64 || publicKey.length != 32)
    {
        throw new BasePlutsError(`unexpected signature length ${signature.length}`);
    }
    
    if( isUint8Array( signature ) )
    {
        signature = buffToByteArr( signature );
    }

    if( isUint8Array( message ) )
    {
        message = buffToByteArr( message );
    }

    if( isUint8Array( publicKey ) )
    {
        publicKey = buffToByteArr( publicKey );
    }

    const R = decodePoint(signature.slice(0, 32));
    const A = decodePoint(publicKey);
    const S = decodeInt(signature.slice(32, 64));
    const h = ihash(signature.slice(0, 32).concat(publicKey).concat(message));

    const left = scalarMul(BASE, S);
    const right = edwards(R, scalarMul(A, h));

    return (left[0] == right[0]) && (left[1] == right[1]);
}
