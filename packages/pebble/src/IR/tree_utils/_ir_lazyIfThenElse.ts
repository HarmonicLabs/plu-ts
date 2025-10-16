import { _ir_apps } from "../IRNodes/IRApp";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRNative } from "../IRNodes/IRNative";
import { IRTerm } from "../IRTerm";

export function _ir_lazyIfThenElse(
    condition: IRTerm,
    thenBranch: IRTerm,
    elseBranch: IRTerm,
): IRForced
{
    return new IRForced(_ir_apps(
        IRNative.strictIfThenElse,
        condition,
        new IRDelayed( thenBranch ),
        new IRDelayed( elseBranch )
    ));
}