import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR/IRNodes/IRNative";

export const psub   = intBinOpToInt( IRNative.subtractInteger);