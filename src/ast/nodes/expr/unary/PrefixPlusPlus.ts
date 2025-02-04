import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";
import { IUnaryExpression } from "./IUnaryExpression";

export class PrefixPlusPlus
    implements HasSourceRange, IUnaryExpression
{
    constructor(
        readonly operand: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class PostfixPlusPlus
    implements HasSourceRange, IUnaryExpression
{
    constructor(
        readonly operand: PebbleExpr,
        readonly range: SourceRange
    ) {}
}