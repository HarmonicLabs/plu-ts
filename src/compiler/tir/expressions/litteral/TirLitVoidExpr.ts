import { SourceRange } from "../../../../ast/Source/SourceRange";
import { void_t } from "../../../AstCompiler/scope/stdScope/stdScope";
import { TirType } from "../../types/TirType";
import { ITirExpr } from "../ITirExpr";

export class TirLitVoidExpr implements ITirExpr
{
    readonly type: TirType = void_t;
    constructor(
        readonly range: SourceRange
    ) {}
}