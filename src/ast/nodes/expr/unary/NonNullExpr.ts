import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";


export class NonNullExpr
    implements HasSourceRange
{
    constructor(
        readonly operand: PebbleExpr,
        readonly range: SourceRange
    ) {}
}