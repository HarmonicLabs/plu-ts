import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleType } from "../../types/PebbleType";
import { PebbleExpr } from "../PebbleExpr";

export class CallExpr implements HasSourceRange
{
    constructor(
        readonly func: PebbleExpr,
        /** if the function is generic */
        readonly genericTypeArgs: PebbleType[] | undefined,
        readonly args: PebbleExpr[],
        readonly range: SourceRange
    ) {}
}