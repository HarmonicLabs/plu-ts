import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "./TirExpr";

export class TirTernaryExpr
    implements HasSourceRange
{
    constructor(
        readonly condition: TirExpr,
        readonly ifTrue: TirExpr,
        readonly ifFalse: TirExpr,
        readonly range: SourceRange
    ) {}
}