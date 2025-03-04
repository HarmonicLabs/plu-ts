import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { bytes_t } from "../../../AstCompiler/scope/stdScope/stdScope";

export class TirLitHexBytesExpr
    implements ITirExpr
{
    readonly type: TirType = bytes_t;
    constructor(
        readonly bytes: Uint8Array,
        readonly range: SourceRange
    ) {}
}