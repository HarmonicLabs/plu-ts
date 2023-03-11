import { IRApp } from "./IRNodes/IRApp";
import { IRFunc } from "./IRNodes/IRFunc";
import { IRHoisted } from "./IRNodes/IRHoisted";
import { IRNative } from "./IRNodes/IRNative";
import { IRVar } from "./IRNodes/IRVar";
import { IRError } from "./IRNodes/IRerror";

export type IRTerm
    = IRVar
    | IRFunc
    | IRApp
    | IRNative
    | IRHoisted
    | IRError;