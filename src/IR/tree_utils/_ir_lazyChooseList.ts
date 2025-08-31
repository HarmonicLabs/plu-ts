import { IRDelayed, IRForced, IRNative } from "../IRNodes";
import { IRTerm } from "../IRTerm";
import { _ir_apps } from "./_ir_apps";

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