import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleAstType } from "../types/PebbleAstType";
import { PebbleExpr } from "./PebbleExpr";


export class InstanceOfExpr
    implements HasSourceRange
{
    constructor(
        readonly instanceExpr: PebbleExpr,
        readonly ofType: PebbleAstType,
        readonly range: SourceRange
    ) {}
}