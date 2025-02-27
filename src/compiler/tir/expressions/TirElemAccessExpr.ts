import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "./TirExpr";

/**
 * `arrLikeExpr[ indexExpr ]`
 */
export class TirElemAccessExpr
    implements HasSourceRange
{
    constructor(
        readonly arrLikeExpr: TirExpr,
        readonly indexExpr: TirExpr,
        readonly range: SourceRange
    ) {}
}