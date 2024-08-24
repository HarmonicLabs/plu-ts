
export const defaultVersion: [ number, number, number ] = Object.freeze([ 1, 1, 0 ]) as any;

export function getValidVersion( version: Readonly<[number, number, number]> ): [number, number, number]
{
    const v = !Array.isArray( version ) || (version as any).length === 0 ? defaultVersion : version;
    return ([0,1,2].map( i => Math.abs( Math.round( v[i] ?? 0 ) ) )) as any;
}