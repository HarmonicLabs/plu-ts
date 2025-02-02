import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";

export interface ILibObjExpr {
    fieldNames: Identifier[];
    values: PebbleExpr[];
}

export class LitObjExpr
    implements HasSourceRange, ILibObjExpr
{
    constructor(
        readonly fieldNames: Identifier[],
        readonly values: PebbleExpr[],
        readonly range: SourceRange
    ) {}
}