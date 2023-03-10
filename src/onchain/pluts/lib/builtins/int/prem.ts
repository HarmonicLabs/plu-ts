import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { intBinOpToInt } from "./intBinOpToInt";

export const prem = intBinOpToInt( Builtin.remainderInteger );