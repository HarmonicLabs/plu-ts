import { IRApp } from "../IRNodes/IRApp";
import { IRCase } from "../IRNodes/IRCase";
import { IRConst } from "../IRNodes/IRConst";
import { IRConstr } from "../IRNodes/IRConstr";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRError } from "../IRNodes/IRError";
import { IRForced } from "../IRNodes/IRForced";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { IRRecursive } from "../IRNodes/IRRecursive";
import { IRSelfCall } from "../IRNodes/IRSelfCall";
import { IRVar } from "../IRNodes/IRVar";
import type { IRTerm } from "../IRTerm";

export function isIRTerm( stuff: any ): stuff is IRTerm
{
    return (
        stuff instanceof IRVar          ||
        stuff instanceof IRSelfCall     ||
        stuff instanceof IRFunc         ||
        stuff instanceof IRRecursive    ||
        stuff instanceof IRApp          ||
        stuff instanceof IRConst        ||
        stuff instanceof IRNative       ||
        stuff instanceof IRLetted       ||
        stuff instanceof IRHoisted      ||
        stuff instanceof IRError        ||
        stuff instanceof IRForced       ||
        stuff instanceof IRDelayed      ||
        stuff instanceof IRConstr       ||
        stuff instanceof IRCase
    );
}