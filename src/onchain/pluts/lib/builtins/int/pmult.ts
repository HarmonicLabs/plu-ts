import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../../../../src/onchain/IR/IRNodes/IRNative";

export const pmult = intBinOpToInt( IRNative.multiplyInteger );