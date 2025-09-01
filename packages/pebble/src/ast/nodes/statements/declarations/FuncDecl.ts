import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { FuncExpr } from "../../expr/functions/FuncExpr";

export class FuncDecl
    implements HasSourceRange
{
    get range(): SourceRange
    {
        return this.expr.range;
    }
    
    constructor(
        readonly expr: FuncExpr,
    ) {}
}