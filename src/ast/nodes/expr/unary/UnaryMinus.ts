import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";
import { IUnaryExpression } from "./IUnaryExpression";

export class UnaryMinus
    implements HasSourceRange, IUnaryExpression
{
    constructor(
        readonly operand: PebbleExpr,
        readonly range: SourceRange
    ) {}
}