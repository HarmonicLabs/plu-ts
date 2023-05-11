import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR";

export const pquot = intBinOpToInt( IRNative.quotientInteger );