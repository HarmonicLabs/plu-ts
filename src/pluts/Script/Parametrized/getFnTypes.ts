import { PrimType, TermType } from "../../../type_system";

/**
 * given a term type of a function (lambda)
 * extracts all the types from the inputs to the output
 * 
 * the last type is the final output of the funciton.
 * 
 * 
 * @example
 * ```ts
 *  const notFn = getFnTypes( int ); // [ int ];
 *  const simleLam = getFnTypes( lam( int, bs ) ); // [ int, bs ];
 *  const twoIns = getFnTypes( fn([ int, str ], bs ) ); // [ int, str, bs ];
 * ```
 * 
 * @param {TermType} fnT function term type
 * @returns {TermType[]}
 */
export function getFnTypes( fnT: TermType ): TermType[]
{
    const result: TermType[] = [];
    
    while( fnT[0] === PrimType.Lambda )
    {
        result.push( fnT[1] ),
        fnT = fnT[2];
    }

    result.push( fnT );

    return result;
}