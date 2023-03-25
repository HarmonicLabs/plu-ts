import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR/IRNodes/IRNative";

export const padd = intBinOpToInt( IRNative.addInteger );