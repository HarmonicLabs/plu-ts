import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { int_t } from "../../../AstCompiler/scope/stdScope/stdScope";

export class TirLitIntExpr
    implements ITirExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly integer: bigint,
        readonly range: SourceRange
    ) {}
}