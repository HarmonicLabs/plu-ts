import type Term from "../pluts/Term";
import type UPLCTerm from "../UPLC/UPLCTerm";
import type { PureUPLCTerm } from "../UPLC/UPLCTerm";

import Machine from "./Machine";

const timeTag = 'evalScript';

/**
 * @deprecated use `Machine.evalSimple` static method instead
 */
export default function evalScript( term: UPLCTerm | Term<any> ): PureUPLCTerm
{
    return Machine.evalSimple( term );
}