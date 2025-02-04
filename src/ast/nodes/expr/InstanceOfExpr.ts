import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleType } from "../types/PebbleType";
import { PebbleExpr } from "./PebbleExpr";


export class InstanceOfExpr
    implements HasSourceRange
{
    constructor(
        readonly instanceExpr: PebbleExpr,
        readonly ofType: PebbleType,
        readonly range: SourceRange
    ) {}
}