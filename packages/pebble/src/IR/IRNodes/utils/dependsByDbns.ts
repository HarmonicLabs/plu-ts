import { IRTerm } from "../../IRTerm";
import { iterTree } from "../../toUPLC/_internal/iterTree";
import { IRSelfCall } from "../IRSelfCall";
import { IRVar } from "../IRVar";

/**
 * returns true if the term depends on *ANY* of the deBrujin indices specified
 */
export function dependsByDbns( term: IRTerm, depsDbns: readonly number[] ): boolean
{
    if( depsDbns.length === 0 ) return false;
    let doesDepend = false;
    iterTree( term,
        (node, diff) => {
            if(
                node instanceof IRVar ||
                node instanceof IRSelfCall
            )
            {
                doesDepend = doesDepend || depsDbns.some( dbn => {
                    const realDbn = dbn + diff;
                    // realDbn === 0 implies no variables are in scope
                    // so if node.dbn === 0 and realDbn === 1 then the 
                    // variable is pointing to that definition
                    return node.dbn === realDbn;
                });
            }
        },
        // shouldSkipNode
        undefined,
        // shouldStop
        () => doesDepend // exit early
    );
    return doesDepend;
}