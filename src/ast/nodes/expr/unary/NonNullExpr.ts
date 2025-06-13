import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";


export class NonNullExpr
    implements HasSourceRange
{
    constructor(
        public operand: PebbleExpr,
        readonly range: SourceRange
    ) {}
}