import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR/IRNodes/IRNative";

export const pdiv = intBinOpToInt( IRNative.divideInteger);