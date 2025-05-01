import { IRTerm } from "../../../IR";
import { TirFuncDecl } from "../../tir/statements/TirFuncDecl";
import { TirCompilerCtx } from "../TirCompilerCtx";

export function compileTirFuncDecl(
    ctx: TirCompilerCtx,
    func: TirFuncDecl
): IRTerm
{
    throw new Error("not implemented");
}