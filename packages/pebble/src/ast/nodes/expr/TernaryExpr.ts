import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class TernaryExpr
    implements HasSourceRange
{
    constructor(
        public condition: PebbleExpr,
        public ifTrue: PebbleExpr,
        public ifFalse: PebbleExpr,
        readonly range: SourceRange
    ) {}
}