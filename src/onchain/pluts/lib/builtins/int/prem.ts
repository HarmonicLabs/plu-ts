import { IRNative } from "../../../../../../../src/onchain/IR/IRNodes/IRNative";
import { intBinOpToInt } from "./intBinOpToInt";

export const prem = intBinOpToInt( IRNative.remainderInteger );