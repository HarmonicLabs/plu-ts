import { IRApp } from "../IRNodes/IRApp";
import { IRConst } from "../IRNodes/IRConst";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRError } from "../IRNodes/IRError";
import { IRForced } from "../IRNodes/IRForced";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { IRVar } from "../IRNodes/IRVar";
import type { IRTerm } from "../IRTerm";

export type IRParentTerm
    = // IRVar
    | IRFunc
    | IRApp
    // | IRConst
    // | IRNative
    | IRLetted
    | IRHoisted
    // | IRError
    | IRForced
    | IRDelayed;

export function isIRParentTerm<T extends IRTerm>( stuff: T ): stuff is (T & IRParentTerm)
{
    return (
        // stuff instanceof IRVar      ||
        stuff instanceof IRFunc     ||
        stuff instanceof IRApp      ||
        // stuff instanceof IRConst    ||
        // stuff instanceof IRNative   ||
        stuff instanceof IRLetted   ||
        stuff instanceof IRHoisted  ||
        // stuff instanceof IRError    ||
        stuff instanceof IRForced   ||
        stuff instanceof IRDelayed
    );
}