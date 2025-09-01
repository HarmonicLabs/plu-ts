import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class TernaryExpr
    implements HasSourceRange
{
    constructor(
        readonly condition: PebbleExpr,
        readonly ifTrue: PebbleExpr,
        readonly ifFalse: PebbleExpr,
        readonly range: SourceRange
    ) {}
}