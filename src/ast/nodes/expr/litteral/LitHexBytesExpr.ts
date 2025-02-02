import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";

export class LitHexBytesExpr
    implements HasSourceRange
{
    constructor(
        readonly bytes: Uint8Array,
        readonly range: SourceRange
    ) {}
}