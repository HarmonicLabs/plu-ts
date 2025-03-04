import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bool_t } from "../../../AstCompiler/scope/stdScope/stdScope";

export class TirLitFalseExpr implements ITirExpr
{
    readonly type: TirType = bool_t
    constructor(
        readonly range: SourceRange
    ) {}
}