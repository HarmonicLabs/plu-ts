import { IRDelayed, IRForced, IRNative } from "../IRNodes";
import { IRTerm } from "../IRTerm";
import { _ir_apps } from "./_ir_apps";

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