import { IRNative } from "../../../../IR";
import { intBinOpToInt } from "./intBinOpToInt";

export const padd = intBinOpToInt( IRNative.addInteger );