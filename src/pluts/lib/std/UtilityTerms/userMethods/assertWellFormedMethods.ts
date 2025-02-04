import type { Methods } from "../../../../../type_system";

/**
 * checks thatevery method name does not have an equivalent that starts with "p"
 * (added by convention to indicate the term rather than the funciton)
 * 
 * @example
 * ```ts
 * const notOk: Methods = {
 *      foo: pfn([ int ], bool)( ... ),
 *      bar: pfn([ int ], bool)( ... ),
 *      // ERROR: 'pfoo' is used to indicate the term counterpart of 'foo'
 *      pfoo: pfn([ int ], bool)( ... )
 * }
 * const ok: Methods = {
 *      foo: pfn([ int ], bool)( ... ),
 *      bar: pfn([ int ], bool)( ... ),
 *      // no problem
 *      // this will generate 'prop' and 'pprop'
 *      // where 'prop' is the funciton and 'pprop' is the term
 *      prop: pfn([ int ], bool)( ... )
 * }
 * ```
 */
export function isWellFormedMethods( methods: Methods ): boolean
{
    const names = Object.keys( methods );
    const pnames: string[] = [];

    for( const name of names )
    {
        if( name.length === 0 ) continue;
        if( name[0] === "p" )
        {
            pnames.push( name.slice(1) );
        }
    }

    return !pnames.some( pname => names.includes( pname ) )
}

export function assertWellFormedMethods( methods: Methods ): void
{
    if( !isWellFormedMethods( methods ) ) throw new Error("methods are not well formed");
}