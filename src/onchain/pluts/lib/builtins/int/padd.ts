import { intBinOpToInt } from "./intBinOpToInt";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";

export const padd = intBinOpToInt( Builtin.addInteger );