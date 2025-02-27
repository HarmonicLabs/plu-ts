import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "./TirExpr";

export class TirParentesizedExpr
    implements HasSourceRange
{
    constructor(
        readonly expr: TirExpr,
        readonly range: SourceRange
    ) {}
}