import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "./TirExpr";

export class TirCallExpr implements HasSourceRange
{
    constructor(
        readonly func: TirExpr,
        readonly args: TirExpr[],
        readonly range: SourceRange
    ) {}
}