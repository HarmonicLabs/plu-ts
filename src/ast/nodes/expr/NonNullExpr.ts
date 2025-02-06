import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleAstType } from "../types/PebbleAstType";
import { PebbleExpr } from "./PebbleExpr";


export class NonNullExpr
    implements HasSourceRange
{
    constructor(
        readonly expr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}