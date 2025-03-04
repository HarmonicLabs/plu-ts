import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirParentesizedExpr
    implements HasSourceRange, ITirExpr
{
    constructor(
        readonly expr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}