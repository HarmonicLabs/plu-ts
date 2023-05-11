import { IRNative } from "../../../../IR";
import { intBinOpToInt } from "./intBinOpToInt";

export const prem = intBinOpToInt( IRNative.remainderInteger );