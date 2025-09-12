import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class ParentesizedExpr
    implements HasSourceRange
{
    constructor(
        public expr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}