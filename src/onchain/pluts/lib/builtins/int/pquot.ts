import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR/IRNodes/IRNative";

export const pquot = intBinOpToInt( IRNative.quotientInteger );