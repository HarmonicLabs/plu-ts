import { IRApp } from "../IRNodes/IRApp";
import { IRCase } from "../IRNodes/IRCase";
import { IRConstr } from "../IRNodes/IRConstr";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRRecursive } from "../IRNodes/IRRecursive";
import type { IRTerm } from "../IRTerm";

export type IRParentTerm
    = // IRVar
    // | IRSelfCall
    | IRFunc
    | IRApp
    // | IRConst
    // | IRNative
    | IRLetted
    | IRHoisted
    // | IRError
    | IRForced
    | IRDelayed
    | IRConstr
    | IRCase
    | IRRecursive;

export function isIRParentTerm<T extends IRTerm>( stuff: T | undefined ): stuff is (T & IRParentTerm)
{
    return (
        // stuff instanceof IRVar      ||
        // stuff instanceof IRSelfCall      ||
        stuff instanceof IRFunc     ||
        stuff instanceof IRRecursive     ||
        stuff instanceof IRApp      ||
        // stuff instanceof IRConst    ||
        // stuff instanceof IRNative   ||
        stuff instanceof IRLetted   ||
        stuff instanceof IRHoisted  ||
        // stuff instanceof IRError    ||
        stuff instanceof IRForced   ||
        stuff instanceof IRDelayed  ||
        stuff instanceof IRConstr   ||
        stuff instanceof IRCase
    );
}