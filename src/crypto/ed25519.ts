import { fromHex, isUint8Array, toHex } from "@harmoniclabs/uint8array-utils";
import { buffToByteArr, byte } from "./types";
import { sha2_512 } from "./sha2_512";

type Uint8ArrayLike = Uint8Array | string | byte[];

/*! 
    @noble/ed25519 implementation

    including the package itself was causing issue because es2020

    reimplementing here (sorry)
*/

const P  = BigInt( "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed" ); // n2 ** 255n - 19n; // ed25519 is twisted edwards curve
const N  = BigInt( "0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed" ); // n2 ** 252n + 27742317777372353535851937790883648493n; // curve's (group) order
const Gx = BigInt( "0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a" ); // base point x
const Gy = BigInt( "0x6666666666666666666666666666666666666666666666666666666666666658" ); // base point y

const n0 = BigInt(0);
const n1 = BigInt(1);
const n2 = BigInt(2);

const N_div_2 = N / n2;

const _n1 = BigInt( -1 );

// Curve's formula is −x² + y² = -a + dx²y²
// where a=-1, d = -(121665/121666) == -(121665 * inv(121666)) mod P
/*
const CURVE = {
  a: -n1,
  d: 37095705934669439343138083508754565189542113879843219016388785533085940283555n,
  p: P, n: N, h: 8, Gx, Gy    // field prime, curve (group) order, cofactor
};
*/
const CURVE_H = 8;
const CURVE_D = BigInt("37095705934669439343138083508754565189542113879843219016388785533085940283555");

type Hex = Uint8Array | string;

const err = (m = ''): never => { throw new Error(m); }; // error helper, messes-up stack trace

const str = (s: unknown): s is string => typeof s === 'string'; // is string

const au8 = ( stuff: unknown, l?: number): Uint8Array =>          // is Uint8Array (of specific length)
{
    if(
        !(stuff instanceof Uint8Array) || 
        (
            typeof l === 'number' && 
            l > 0 && 
            stuff.length !== l
        )
    ) throw new Error('Uint8Array expected');

    return stuff;
}

/** creates Uint8Array */
const u8n = (data?: any) => new Uint8Array(data);
/** norm(hex/u8a) to u8a */
const toU8 = (a: Hex, len?: number) => au8(str(a) ? fromHex(a) : u8n(a), len);
/** mod division */
const mod = (a: bigint, b = P) => {
    let r = a % b; 
    return r >= n0 ? r : b + r;
};

let Gpows: PointLike[] | undefined = undefined;             // precomputes for base point G

interface AffinePoint { x: bigint, y: bigint }              // PointLike in 2d xy affine coordinates

type PointLike = [ x: bigint, y: bigint, z: bigint, t: bigint ];

function pointFromXY( x: bigint, y: bigint ): PointLike
{
    return [ x, y, n1, mod(x * y) ];
}

function pointFromHex( hex: Hex, zip215 = false ): PointLike
{
    hex = toU8(hex, 32);

    const normed = hex.slice();                         // copy the array to not mess it up
    
    normed[31] = hex[31] & ~0x80;                       // adjust first LE byte = last BE byte
    
    const y = b2n_LE(normed);                           // decode as little-endian, convert to num
    
    if( zip215 )
    {
        if(!(n0 <= y && y < BigInt("0x1" + "00".repeat(32)) /* n2 ** 256n */ ))
        {
            err('bad y coord 1');
        }
    }
    else
    {
        if(!(n0 <= y && y < P))
        {
            err('bad y coord 2')
        }
    }

    const y2 = mod(y * y);                              // y²
    const u = mod(y2 - n1);                             // u=y²-1
    const v = mod(CURVE_D * y2 + n1);                   // v=dy²+1
    let { isValid, value: x } = uvRatio(u, v);          // (uv³)(uv⁷)^(p-5)/8; square root
    
    if(!isValid) err('bad y coordinate 3');             // not square root: bad point
    
    const isXOdd = (x & n1) === n1;                     // adjust sign of x coordinate
    const isHeadOdd = (hex[31] & 0x80) !== 0;
    if (isHeadOdd !== isXOdd) x = mod(-x);
    
    return [ x, y, n1, mod(x * y) ];             // Z=1, T=xy
}

const BASE_PX = Gx;
const BASE_PY = Gy;
const BASE_PZ = n1;
const BASE_PT = mod(Gx * Gy);

const G: PointLike = Object.freeze([
    BASE_PX,
    BASE_PY,
    BASE_PZ,
    BASE_PT
]) as any;

const ZERO_PX = n0;
const ZERO_PY = n1;
const ZERO_PZ = n1;
const ZERO_PT = n0;

const I: PointLike = Object.freeze([
    ZERO_PX,
    ZERO_PY,
    ZERO_PZ,
    ZERO_PT
]) as any;

function equalsPoints(
    X1: bigint, Y1: bigint, Z1: bigint,
    X2: bigint, Y2: bigint, Z2: bigint,
): boolean
{
    return mod(X1 * Z2) === mod(X2 * Z1) && mod(Y1 * Z2) === mod(Y2 * Z1);
}

function pointIsZero(
    X1: bigint, Y1: bigint, Z1: bigint
): boolean
{
    return equalsPoints(
        X1, Y1, Z1,
        ZERO_PX,
        ZERO_PY,
        ZERO_PZ,
    );
}

function negatePoint( x: bigint, y: bigint, z: bigint, t: bigint ): PointLike
{
    return [mod(-x), y, z, mod(-t)]
}

function negatePointLike( [x, y, z, t]: PointLike ): PointLike
{
    return [mod(-x), y, z, mod(-t)]
}

function negatePointLike_inplace( p: PointLike ): void
{
    p[0] = mod(-p[0]);
    p[3] = mod(-p[3]);
}

function doublePoint( X1: bigint, Y1: bigint, Z1: bigint ): PointLike
{
    const a = _n1; // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    const A = mod(X1 * X1); const B = mod(Y1 * Y1); const C = mod(n2 * mod(Z1 * Z1));
    const D = mod(a * A); const x1y1 = X1 + Y1; const E = mod(mod(x1y1 * x1y1) - A - B);
    const G = D + B; const F = G - C; const H = D - B;
    const X3 = mod(E * F); const Y3 = mod(G * H); const T3 = mod(E * H); const Z3 = mod(F * G);
    return [X3, Y3, Z3, T3];
}

function addPoints(
    X1: bigint, Y1: bigint, Z1: bigint, T1: bigint,
    X2: bigint, Y2: bigint, Z2: bigint, T2: bigint
): PointLike
{
    // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#addition-add-2008-hwcd-3
    const A = mod(X1 * X2); const B = mod(Y1 * Y2); const C = mod(T1 * CURVE_D * T2);
    const D = mod(Z1 * Z2); const E = mod((X1 + Y1) * (X2 + Y2) - A - B);
    const F = mod(D - C); const G = mod(D + C); const H = mod(B - _n1 * A);
    const X3 = mod(E * F);
    const Y3 = mod(G * H);
    const T3 = mod(E * H);
    const Z3 = mod(F * G);
    return [X3, Y3, Z3, T3];   
}

function addPoinLikeInFirst(
    fst: PointLike,
    snd: PointLike
): void
{
    const [ X1, Y1, Z1, T1 ] = fst;
    const [ X2, Y2, Z2, T2 ] = snd;

    // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#addition-add-2008-hwcd-3
    const A = mod(X1 * X2); const B = mod(Y1 * Y2); const C = mod(T1 * CURVE_D * T2);
    const D = mod(Z1 * Z2); const E = mod((X1 + Y1) * (X2 + Y2) - A - B);
    const F = mod(D - C); const G = mod(D + C); const H = mod(B - _n1 * A);

    fst[0] = mod(E * F);
    fst[1] = mod(G * H);
    fst[2] = mod(E * H);
    fst[3] = mod(F * G);
}

function pointLikeScalarMul(
    point: PointLike,
    n: bigint,
    safe = true
)
{

}

function scalarMul(
    X1: bigint, Y1: bigint, Z1: bigint, T1: bigint,
    n: bigint,
    safe = true
): PointLike
{
    if(n === n0) return safe === true ? err('cannot multiply by 0') : I;

    if(!(typeof n === 'bigint' && n0 < n && n < N)) err('invalid scalar, must be < L');

    if(!safe && pointIsZero( X1, Y1, Z1 ) || n === n1) return [ X1, Y1, Z1, T1 ];   // safe=true bans 0. safe=false allows 0.
    
    if(
        equalsPoints(
            X1, Y1, Z1,
            BASE_PX,
            BASE_PY,
            BASE_PZ,
        )
    ) return wNAF(n).p;               // use wNAF precomputes for base points

    let p = I, f = G;                                   // init result point & fake point
    for (
        ; n > n0;
        // double-and-add ladder 
        [ X1, Y1, Z1, T1 ] = doublePoint( X1, Y1, Z1 ), n >>= n1
    )
    {
        if(n & n1)
        p = addPoints(
            p[0], p[1], p[2], p[3],
            X1, Y1, Z1, T1
        );                        // if bit is present, add to point
        else if(safe){
            // if not, add to fake for timing safety
            f = addPoints(
                f[0], f[1], f[2], f[3],
                X1, Y1, Z1, T1
            )
        }
    }
    return p;
}

function getClearCofactor( X1: bigint, Y1: bigint, Z1: bigint, T1: bigint ): PointLike
{
    return scalarMul( X1, Y1, Z1, T1, BigInt(CURVE_H), false );
}

function isSmallOrderPoint( X1: bigint, Y1: bigint, Z1: bigint, T1: bigint ): boolean
{
    [ X1, Y1, Z1 ] = getClearCofactor( X1, Y1, Z1, T1 );
    return pointIsZero( X1, Y1, Z1 );
}

/** converts point to 2d xy affine point */
function toAffine( p: PointLike ): AffinePoint
{
    const [ x, y, z ] = p;               // (x, y, z, t) ∋ (x=x/z, y=y/z, t=xy)
    if( pointIsZero( x, y, z ) ) return { x: n0, y: n0 }; 

    const iz = invert(z);                               // z^-1: invert z
    if (mod(z * iz) !== n1) err('invalid inverse');     // (z * z^-1) must be 1, otherwise bad math
    
    return { x: mod(x * iz), y: mod(y * iz) }           // x = x*z^-1; y = y*z^-1
}

function toRawUint8Array( p: PointLike ): Uint8Array
{
    const { x, y } = toAffine( p );                     // convert to affine 2d point
    const b = n2b_32LE( y );                              // encode number to 32 Uint8Array
    b[31] |= x & n1 ? 0x80 : 0;                         // store sign in first LE byte
    return b;
}

const padh = (num: number | bigint, pad: number) => num.toString(16).padStart(pad, '0');

const n2b_32LE = (num: bigint) => fromHex(padh(num, 32 * 2)).reverse(); // number to Uint8Array LE

const b2n_LE = (b: Uint8Array): bigint => BigInt('0x' + toHex(u8n(au8(b)).reverse())); // Uint8Array LE to num

const concatB = (...arrs: Uint8Array[]) => {                 // concatenate Uint8Array-s
    const r = u8n(arrs.reduce((sum, a) => sum + au8(a).length, 0)); // create u8a of summed length
    let pad = 0;                                          // walk through each array,
    arrs.forEach(a => {r.set(a, pad); pad += a.length});  // ensure they have proper type
    return r;
};

const invert = (num: bigint, md = P): bigint => {       // modular inversion
    if (num === n0 || md <= n0) err('no inverse n=' + num + ' mod=' + md); // no neg exponent for now
    let a = mod(num, md), b = md, x = n0, y = n1, u = n1, v = n0;
    while (a !== n0) {                                    // uses euclidean gcd algorithm
        const q = b / a, r = b % a;                         // not constant-time
        const m = x - u * q, n = y - v * q;
        b = a, a = r, x = u, y = v, u = m, v = n;
    }
    return b === n1 ? mod(x, md) : err('no inverse');     // b is gcd at this point
};

const pow2 = (x: bigint, power: bigint): bigint => {    // pow2(x, 4) == x^(2^4)
    let r = x;
    while (power-- > n0) { r *= r; r %= P; }
    return r;
}

const pow_2_252_3 = (x: bigint) => {                    // x^(2^252-3) unrolled util for square root
    const x2 = (x * x) % P;                               // x^2,       bits 1
    const b2 = (x2 * x) % P;                              // x^3,       bits 11
    const b4 = (pow2(b2, n2) * b2) % P;                   // x^(2^4-1), bits 1111
    const b5 = (pow2(b4, n1) * x) % P;                    // x^(2^5-1), bits 11111
    const b10 = (pow2(b5, BigInt(5)) * b5) % P;                  // x^(2^10)
    const b20 = (pow2(b10, BigInt(10)) * b10) % P;               // x^(2^20)
    const b40 = (pow2(b20, BigInt(20)) * b20) % P;               // x^(2^40)
    const b80 = (pow2(b40, BigInt(40)) * b40) % P;               // x^(2^80)
    const b160 = (pow2(b80,  BigInt(80)) * b80) % P;              // x^(2^160)
    const b240 = (pow2(b160, BigInt(80)) * b80) % P;             // x^(2^240)
    const b250 = (pow2(b240, BigInt(10)) * b10) % P;             // x^(2^250)
    const pow_p_5_8 = (pow2(b250, n2) * x) % P; // < To pow to (p+3)/8, multiply it by x.
    return { pow_p_5_8, b2 };
}

const RM1 = BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752"); // √-1

const uvRatio = (u: bigint, v: bigint): { isValid: boolean, value: bigint } => { // for sqrt comp
    const v3 = mod(v * v * v);                            // v³
    const v7 = mod(v3 * v3 * v);                          // v⁷
    const pow = pow_2_252_3(u * v7).pow_p_5_8;            // (uv⁷)^(p-5)/8
    let x = mod(u * v3 * pow);                            // (uv³)(uv⁷)^(p-5)/8
    const vx2 = mod(v * x * x);                           // vx²
    const root1 = x;                                      // First root candidate
    const root2 = mod(x * RM1);                           // Second root candidate; RM1 is √-1
    const useRoot1 = vx2 === u;                           // If vx² = u (mod p), x is a square root
    const useRoot2 = vx2 === mod(-u);                     // If vx² = -u, set x <-- x * 2^((p-1)/4)
    const noRoot = vx2 === mod(-u * RM1);                 // There is no valid root, vx² = -u√-1
    if (useRoot1) x = root1;
    if (useRoot2 || noRoot) x = root2;                    // We return root2 anyway, for const-time
    if ((mod(x) & n1) === n1) x = mod(-x);                // edIsNegative
    return { isValid: useRoot1 || useRoot2, value: x };
}

const modL_LE = (hash: Uint8Array): bigint => mod(b2n_LE(hash), N); // modulo L; but little-endian

type Sha512FnSync = undefined | ((...messages: Uint8Array[]) => Uint8Array);

let _shaS: Sha512FnSync;

const sha512s = ( message : Uint8Array ) => new Uint8Array( sha2_512( buffToByteArr( message ) ) )

type ExtK = { head: Uint8Array, prefix: Uint8Array, scalar: bigint, point: PointLike, pointUint8Array: Uint8Array };

/** RFC8032 5.1.5 */
const hash2extK = (hashed: Uint8Array): ExtK =>
{
    const head = hashed.slice(0, 32);                     // slice creates a copy, unlike subarray
    head[0] &= 248;                                       // Clamp bits: 0b1111_1000,
    head[31] &= 127;                                      // 0b0111_1111,
    head[31] |= 64;                                       // 0b0100_0000
    
    const prefix = hashed.slice(32, 64);                  // private key "prefix"
    
    const scalar = modL_LE(head);                         // modular division over curve order
    
    // public key point
    const point =  scalarMul(
        BASE_PX,
        BASE_PY,
        BASE_PZ,
        BASE_PT,
        scalar
    );

    return { head, prefix, scalar, point, pointUint8Array: toRawUint8Array( point ) };
}

// RFC8032 5.1.5; getPublicKey async, sync. Hash priv key and extract point.

const getExtendedPublicKey = (priv: Hex) => hash2extK(sha512s(toU8(priv, 32)))

const getPublicKey = (priv: Hex): Uint8Array => getExtendedPublicKey(priv).pointUint8Array;

type Finishable<T> = {                                  // Reduces logic duplication between
    hashable: Uint8Array, finish: (hashed: Uint8Array) => T         // sync & async versions of sign(), verify()
}                                                       // hashable=start(); finish(hash(hashable));

function hashFinish<T>( res: Finishable<T> ): T
{
    return res.finish(sha512s(res.hashable));
}

const _sign = (e: ExtK, rUint8Array: Uint8Array, msg: Uint8Array): Finishable<Uint8Array> => { // sign() shared code
    const { pointUint8Array: P, scalar: s } = e;
    const r = modL_LE(rUint8Array);                            // r was created outside, reduce it modulo L
    // R = [r]B
    const R = toRawUint8Array(
        scalarMul(
            BASE_PX,
            BASE_PY,
            BASE_PZ,
            BASE_PT,
            r
        )
    );
    const hashable = concatB(R, P, msg);                  // dom2(F, C) || R || A || PH(M)
    const finish = (hashed: Uint8Array): Uint8Array => {            // k = SHA512(dom2(F, C) || R || A || PH(M))
      const S = mod(r + modL_LE(hashed) * s, N);          // S = (r + k * s) mod L; 0 <= s < l
      return au8(concatB(R, n2b_32LE(S)), 64);            // 64-byte sig: 32b R.x + 32b LE(S)
    }
    return { hashable, finish };
};

const sign = (msg: Hex, privKey: Hex): Uint8Array => {
  const m = toU8(msg);                                  // RFC8032 5.1.6: sign msg with key sync
  const e = getExtendedPublicKey(privKey);              // pub,prfx
  const rUint8Array = sha512s( m );                  // r = SHA512(dom2(F, C) || prefix || PH(M))
  return hashFinish( _sign(e, rUint8Array, m) );        // gen R, k, S, then 64-byte signature
};

const dvo = { zip215: true };

const _verify = (sig: Hex, msg: Hex, pub: Hex, opts = dvo): Finishable<boolean> => {
    msg = toU8(msg);                                      // Message hex str/Uint8Array
    sig = toU8(sig, 64);                                  // Signature hex str/Uint8Array, must be 64 Uint8Array
    const { zip215 } = opts;                              // switch between zip215 and rfc8032 verif
    let A: PointLike, R: PointLike, s: bigint, SB: PointLike, hashable = new Uint8Array();
    try { 
        A = pointFromHex(pub, zip215);                     // public key A decoded
        R = pointFromHex(sig.slice(0, 32), zip215);        // 0 <= R < 2^256: ZIP215 R can be >= P
        s = b2n_LE(sig.slice(32, 64));                      // Decode second half as an integer S
        // in the range 0 <= s < L
        SB = scalarMul(
            BASE_PX,
            BASE_PY,
            BASE_PZ,
            BASE_PT,
            s,
            false
        );
        hashable = concatB(toRawUint8Array( R ), toRawUint8Array( A ), msg); // dom2(F, C) || R || A || PH(M)  
    } catch (error) {}
  
    const finish = (hashed: Uint8Array): boolean => {          // k = SHA512(dom2(F, C) || R || A || PH(M))
        if (SB == null) return false;                       // false if try-catch catched an error
        const k = modL_LE(hashed);                          // decode in little-endian, modulo L

        const A_mult_k = scalarMul(
            A[0], A[1], A[2], A[3],
            k,
            false
        );
        // [8]R + [8][k]A'
        const RkA = addPoints(
            R[0], R[1], R[2], R[3],
            A_mult_k[0],
            A_mult_k[1],
            A_mult_k[2],
            A_mult_k[3]
        );

        negatePointLike_inplace( SB );

        const added = addPoints(
            ...RkA,
            ...SB
        );

        const [ x, y, z ] = getClearCofactor(
            ...added
        ); 

        return pointIsZero( x, y, z );      // [8][S]B = [8]R + [8][k]A'
    }
    return { hashable, finish };
};

/** RFC8032 5.1.7: verification */
const verify = (s: Hex, m: Hex, p: Hex, opts = dvo) =>
    hashFinish( _verify(s, m, p) );

declare const globalThis: Record<string, any> | undefined; // Typescript symbol present in browsers

const cr = () => // We support: 1) browsers 2) node.js 19+
    typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;

// CSPRNG (random number generator)
function randomUint8Array(len: number): Uint8Array
{
    const crypto = cr(); // Can be shimmed in node.js <= 18 to prevent error:
    // import { webcrypto } from 'node:crypto';
    // if (!globalThis.crypto) globalThis.crypto = webcrypto;
    if (!crypto) err('crypto.getRandomValues must be defined');
    return crypto.getRandomValues(u8n(len));
}

function randomPrivateKey(): Uint8Array
{
    return randomUint8Array( 32 );
}

const W = 8;                                            // Precomputes-related code. W = window size

const _2_pow_W_1 = 2 ** (W - 1);
const _2_pow_W = 2 ** W;

const precompute = () => {                              // They give 12x faster getPublicKey(),
    const points: PointLike[] = [];                           // 10x sign(), 2x verify(). To achieve this,
    const windows = 256 / W + 1;                          // app needs to spend 40ms+ to calculate
    let p = G, b = p;                                     // a lot of points related to base point G.
    for (let w = 0; w < windows; w++)   //  Points are stored in array and used
    {
        b = p;                                              // any time Gx multiplication is done.
        points.push(b);                                     // They consume 16-32 MiB of RAM.
        for (let i = 1; i < _2_pow_W_1; i++)
        {
            // needs to create a new point each time
            // otherwise we update a precomputed point
            b = addPoints(
                ...b,
                ...p
            ) 
            points.push(b);
        }
        p = doublePoint( b[0], b[1], b[2] ) // b.double();// Precomputes don't speed-up getSharedKey,
    }                                                     // which multiplies user point by scalar,
    return points;                                        // when precomputes are using base point
}

/**
 * w-ary non-adjacent form (wNAF) method.
 * Compared to other point mult methods,
 * stores 2x less points using subtraction
 * @param n 
 * @returns 
 */
const wNAF = (n: bigint): { p: PointLike; f: PointLike } => {
    const comp = Gpows ?? (Gpows = precompute());

    const neg = (cnd: boolean, p: PointLike) => {
        return cnd ? negatePointLike( p ) : p;
    } // negate

    // must clone here not to modify the constants
    let p = I.slice() as PointLike,
        f = G.slice() as PointLike; // f must be G, or could become I in the end
    
    const windows = 1 + 256 / W;                          // W=8 17 windows
    const wsize = _2_pow_W_1;                           // W=8 128 window size
    const mask = BigInt(_2_pow_W - 1);                      // W=8 will create mask 0b11111111
    const maxNum = _2_pow_W;                                // W=8 256
    const shiftBy = BigInt(W);                            // W=8 8
    for (let w = 0; w < windows; w++) {
        const off = w * wsize;
        let wbits = Number(n & mask);                       // extract W bits.
        n >>= shiftBy;                                      // shift number by W bits.
        if (wbits > wsize) { wbits -= maxNum; n += n1; }    // split if bits > max: +224 => 256-32
        const off1 = off, off2 = off + Math.abs(wbits) - 1; // offsets, evaluate both
        const cnd1 = w % 2 !== 0, cnd2 = wbits < 0;         // conditions, evaluate both
        if (wbits === 0) {
            addPoinLikeInFirst(
                f,
                neg(cnd1, comp[off1])
            )
            // f = f.add(neg(cnd1, comp[off1]));                 // bits are 0: add garbage to fake point
        } else {                                            //          ^ can't add off2, off2 = I
            addPoinLikeInFirst(
                p,
                neg(cnd2, comp[off2])
            )
            // p = p.add(neg(cnd2, comp[off2]));                 // bits are 1: add to result point
        }
    }
    return { p, f }                                       // return both real and fake points for JIT
};        // !! you can disable precomputes by commenting-out call of the wNAF() inside PointLike#mul()



function forceUint8Array( stuff: Uint8ArrayLike ): Uint8Array
{
    if( typeof stuff === "string" ) return fromHex( stuff );
    return isUint8Array( stuff ) ? stuff : new Uint8Array( stuff )
}

/**
 * based on the [`globalThis.crypto`](https://developer.mozilla.org/en-US/docs/Web/API/crypto_property) property
**/
export function genKeys(): { privateKey: Uint8Array, publicKey: Uint8Array }
{
    const privateKey = randomPrivateKey()
    return {
        privateKey,
        publicKey: getPublicKey( privateKey )
    };
}

export function deriveEd25519PublicKey( privateKey: Uint8ArrayLike ): Uint8Array
{
    return getPublicKey( forceUint8Array( privateKey ) )
}

export function signEd25519( message: Uint8ArrayLike, privateKey: Uint8ArrayLike ): [ pubKey: Uint8Array, signature: Uint8Array ]
{
    return [
        deriveEd25519PublicKey( privateKey ),
        sign(
            forceUint8Array( message ),
            forceUint8Array( privateKey )
        )
    ];
}

export function getEd25519Signature( message: Uint8ArrayLike, privateKey: Uint8ArrayLike ): Uint8Array
{
    return sign(
        forceUint8Array( message ),
        forceUint8Array( privateKey )
    );
}

export function verifyEd25519Signature( signature: Uint8ArrayLike, message: Uint8ArrayLike, publicKey: Uint8ArrayLike ): boolean
{
    return verify(
        forceUint8Array( signature ),
        forceUint8Array( message ),
        forceUint8Array( publicKey )
    )
}
