import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class CommaExpr
    implements HasSourceRange
{
    constructor(
        readonly exprs: PebbleExpr[],
        readonly range: SourceRange
    ) {}
}