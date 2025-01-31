import { IRTerm } from "../../IRTerm";
import { iterTree } from "../../toUPLC/_internal/iterTree";
import { IRSelfCall } from "../IRSelfCall";
import { IRVar } from "../IRVar";

export function isClosedAtDbn( term: IRTerm, dbn: number = 0 ): boolean
{
    let isClosed = true;
    iterTree( term,
        (node, diff) => {
            const realDbn = dbn + diff;
            if(
                node instanceof IRVar ||
                node instanceof IRSelfCall
            )
            {
                // realDbn === 0 implies no variables are in scope
                // so if node.dbn === 0 and realDbn === 0 then the variable is open
                // and is pointing outside of the scope
                isClosed = isClosed || node.dbn < realDbn;
            }

        },
        // shouldSkipNode
        undefined,
        // shouldStop
        () => !isClosed // exit early
    )
    return isClosed;
}