import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleAstType } from "../../types/PebbleAstType";
import { PebbleExpr } from "../PebbleExpr";

export class CallExpr implements HasSourceRange
{
    constructor(
        readonly func: PebbleExpr,
        /** if the function is generic */
        readonly genericTypeArgs: PebbleAstType[] | undefined,
        readonly args: PebbleExpr[],
        readonly range: SourceRange
    ) {}
}