import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { TirFuncDecl } from "../statements/TirFuncDecl";
import { ITirExpr } from "./ITirExpr";

export class TirFuncExpr
    implements ITirExpr
{
    constructor(
        readonly decl: TirFuncDecl,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}