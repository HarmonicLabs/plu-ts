import { IRTerm } from "../../IRTerm";

export function lowestCommonAncestor( n1: IRTerm | undefined, n2: IRTerm | undefined ): IRTerm | undefined
{
    if( n1 === undefined || n2 === undefined ) return undefined;

    let d1: number = (n1 as any).depth;
    let d2: number = (n2 as any).depth;
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
        if (n1 === n2)
            return n1;

        // as any because undefined will exit the loop 
        n1 = n1.parent as any;
        n2 = n2.parent as any;
    }

    return undefined;
}
