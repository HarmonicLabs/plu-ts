import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class CaseExpr
    implements HasSourceRange
{
    constructor(
        readonly matchExpr: PebbleExpr,
        readonly cases: CaseExprCase[],
        readonly range: SourceRange,
    ) {}
}

export class CaseExprCase
    implements HasSourceRange
{
    constructor(
        readonly pattern: PebbleExpr,
        readonly body: PebbleExpr,
        readonly range: SourceRange,
    ) {}
}