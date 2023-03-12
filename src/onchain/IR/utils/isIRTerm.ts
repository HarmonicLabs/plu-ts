import { IRApp } from "../IRNodes/IRApp";
import { IRConst } from "../IRNodes/IRConst";
import { IRError } from "../IRNodes/IRError";
import { IRFunc, IRVar } from "../IRNodes/IRFunc";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { IRTerm } from "../IRTerm";

export function isIRTerm<T>( stuff: T ): stuff is (T & IRTerm)
{
    return (
        stuff instanceof IRVar      ||
        stuff instanceof IRFunc     ||
        stuff instanceof IRApp      ||
        stuff instanceof IRConst    ||
        stuff instanceof IRNative   ||
        stuff instanceof IRLetted   ||
        stuff instanceof IRHoisted  ||
        stuff instanceof IRError
    );
}