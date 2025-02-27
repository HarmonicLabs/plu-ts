import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

// TODO:
// should optionally check for destructuring 
export class IsExpr
    implements HasSourceRange
{
    constructor(
        readonly instanceExpr: PebbleExpr,
        readonly ofType: Identifier,
        readonly range: SourceRange
    ) {}
}