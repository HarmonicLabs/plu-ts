import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR";

export const pmod = intBinOpToInt( IRNative.modInteger );