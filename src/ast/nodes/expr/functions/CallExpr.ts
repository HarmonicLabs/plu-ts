import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { AstTypeExpr } from "../../types/AstTypeExpr";
import { PebbleExpr } from "../PebbleExpr";

export class CallExpr implements HasSourceRange
{
    constructor(
        readonly func: PebbleExpr,
        /** if the function is generic */
        readonly genericTypeArgs: AstTypeExpr[] | undefined,
        readonly args: PebbleExpr[],
        readonly range: SourceRange
    ) {}
}