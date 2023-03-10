import type { Term } from "../pluts/Term";
import type { UPLCTerm } from "../UPLC/UPLCTerm";
import type { PureUPLCTerm } from "../UPLC/UPLCTerm";

import { Machine } from "./Machine";

export * from "./Machine"

/**
 * @deprecated use `Machine.evalSimple` static method instead
 */
export function evalScript( term: UPLCTerm | Term<any> ): PureUPLCTerm
{
    return Machine.evalSimple( term );
}