import { equalIrHash } from "../IRHash";
import { IRTerm } from "../IRTerm";

/**
 * forces hash evaluation
 */
export function equalIRTermHash( a: IRTerm, b: IRTerm ): boolean
{
    return a === b || equalIrHash( a.hash, b.hash );
}

/**
 * only checks the hash if already present ON BOTH
 * 
 * otherwise it assumes the terms are different and returns false
 * (even if they might be the same)
 */
export function shallowEqualIRTermHash( a: IRTerm, b: IRTerm ): boolean
{
    if( a === b ) return true;

    return (
        a.isHashPresent() && b.isHashPresent() && 
        equalIrHash( a.hash, b.hash )
    );
}