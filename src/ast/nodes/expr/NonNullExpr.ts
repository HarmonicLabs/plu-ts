import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { AstTypeExpr } from "../types/AstTypeExpr";
import { PebbleExpr } from "./PebbleExpr";


export class NonNullExpr
    implements HasSourceRange
{
    constructor(
        readonly expr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}