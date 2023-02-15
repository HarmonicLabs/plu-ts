import { intBinOpToInt } from "./intBinOpToInt";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";

export const pdiv = intBinOpToInt( Builtin.divideInteger);