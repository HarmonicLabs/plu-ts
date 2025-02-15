import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { AstTypeExpr } from "../types/AstTypeExpr";
import { PebbleExpr } from "./PebbleExpr";


export class InstanceOfExpr
    implements HasSourceRange
{
    constructor(
        readonly instanceExpr: PebbleExpr,
        readonly ofType: AstTypeExpr,
        readonly range: SourceRange
    ) {}
}