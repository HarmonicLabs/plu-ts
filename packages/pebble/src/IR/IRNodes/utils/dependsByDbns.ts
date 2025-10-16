import { IRTerm } from "../../IRTerm";
import { iterTree } from "../../toUPLC/_internal/iterTree";
import { IRSelfCall } from "../IRSelfCall";
import { IRVar } from "../IRVar";

/**
 * returns true if the term depends on *ANY* of the deBrujin indices specified
 */
export function dependsByVars( term: IRTerm, depsVars: readonly symbol[] ): boolean
{
    if( depsVars.length === 0 ) return false;
    let doesDepend = false;
    iterTree( term,
        (node, diff) => {
            if(
                node instanceof IRVar
                || node instanceof IRSelfCall
            ) {
                doesDepend = doesDepend || depsVars.some( sym => node.name === sym );
            }
        },
        // shouldSkipNode
        undefined,
        // shouldStop
        () => doesDepend // exit early
    );
    return doesDepend;
}