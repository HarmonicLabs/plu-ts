import { IRTerm } from "../../../IR";
import { TirFuncExpr } from "../../tir/expressions/TirFuncExpr";
import { TirCompilerCtx } from "../TirCompilerCtx";

export function compileTirFuncExpr(
    ctx: TirCompilerCtx,
    func: TirFuncExpr
): IRTerm
{
    throw new Error("not implemented");
}