import { intBinOpToInt } from "./intBinOpToInt";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";

export const pmod = intBinOpToInt( Builtin.modInteger );