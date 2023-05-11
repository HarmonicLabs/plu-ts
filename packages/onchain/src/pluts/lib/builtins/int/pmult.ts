import { intBinOpToInt } from "./intBinOpToInt";
import { IRNative } from "../../../../IR";

export const pmult = intBinOpToInt( IRNative.multiplyInteger );