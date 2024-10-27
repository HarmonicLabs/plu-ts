import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { iterTree } from "../_internal/iterTree";


function hasAtLeastNVarsAtDbn( term: IRTerm, baseDbn: number = 0 ): boolean
{
    let n = 0;

    iterTree( term,
        (node, dbn) => {
            if( node instanceof IRVar && node.dbn === baseDbn + dbn ) n++;
        },
        undefined, // shouldSkipNode
        () => n > 1 // shouldExit
    );

    return n > 1;
}