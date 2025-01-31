import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR/IRNodes/IRNative";

export const pmult = intBinOpToInt( IRNative.multiplyInteger );