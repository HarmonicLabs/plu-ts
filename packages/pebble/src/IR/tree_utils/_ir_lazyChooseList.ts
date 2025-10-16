import { _ir_apps } from "../IRNodes/IRApp";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRNative } from "../IRNodes/IRNative";
import type { IRTerm } from "../IRTerm";

export function _ir_lazyChooseList(
    listTerm: IRTerm,
    caseNil: IRTerm,
    caseCons: IRTerm,
): IRForced
{
    return new IRForced(_ir_apps(
        IRNative.strictChooseList,
        listTerm,
        new IRDelayed( caseNil ),
        new IRDelayed( caseCons )
    ));
}