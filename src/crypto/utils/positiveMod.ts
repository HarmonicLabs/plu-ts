
export function positiveMod(x: bigint, n: bigint): bigint
{
    const _n = BigInt( n );
	const res = BigInt( x ) % _n;
    return res < BigInt(0) ? res + _n : res;
}