import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { intBinOpToInt } from "./intBinOpToInt";

export const padd = intBinOpToInt( IRNative.addInteger );