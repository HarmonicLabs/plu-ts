import type { IRTerm } from "../../IRTerm";
import { isIRTerm } from "../../utils/isIRTerm";

// type IRWithDepth = IRTerm & { depth: number }

export function getDepthInMaxScope( term: IRTerm, maxScope: IRTerm ): number | undefined
{
    let depth = 0;

    while( term.parent !== maxScope )
    {
        depth++;
        if( term.parent === undefined ) return undefined
        term = term.parent;
    }

    return depth;
}

export function lowestCommonAncestor( n1: IRTerm | undefined, n2: IRTerm | undefined, maxScope: IRTerm ): IRTerm | undefined
{
    if( !isIRTerm( n1 ) || !isIRTerm( n2 ) ) return undefined;

    let d1: number | undefined = getDepthInMaxScope( n1, maxScope );
    let d2: number | undefined = getDepthInMaxScope( n2, maxScope );

    if( d1 === undefined || d2 === undefined )
    {
        return undefined;
    }

    let diff: number = d1 - d2;

    // If node b is deeper, swap node a and node b
    if (diff < 0)
    {
        let temp = n1;
        n1 = n2;
        n2 = temp;
        diff = -diff;
    }

    // Move n1 up until it reaches the same level as n2
    while( diff-- > 0 && n1.parent )
        n1 = n1.parent;
    
    // Now n1 and n2 are at same levels
    while( n1 && n2 )
    {
        if(n1 === n2)
            return n1;

        // undefined will exit the loop 
        n1 = n1.parent;
        n2 = n2.parent;
    }

    return undefined;
}
