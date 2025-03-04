import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

/**
 * `arrLikeExpr[ indexExpr ]`
 */
export class TirElemAccessExpr
    implements ITirExpr
{
    constructor(
        readonly arrLikeExpr: TirExpr,
        readonly indexExpr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}