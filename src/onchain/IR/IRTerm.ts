import { IRApp } from "./IRNodes/IRApp";
import { IRConst } from "./IRNodes/IRConst";
import { IRFunc, IRVar } from "./IRNodes/IRFunc";
import { IRHoisted } from "./IRNodes/IRHoisted";
import { IRLetted } from "./IRNodes/IRLetted";
import { IRNative } from "./IRNodes/IRNative";
import { IRError } from "./IRNodes/IRError";

export type IRTerm
    = IRVar
    | IRFunc
    | IRApp
    | IRConst
    | IRNative
    | IRLetted
    | IRHoisted
    | IRError;