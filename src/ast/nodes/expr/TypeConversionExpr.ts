import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleType } from "../types/PebbleType";
import { PebbleExpr } from "./PebbleExpr";


export class TypeConversionExpr
    implements HasSourceRange
{
    constructor(
        readonly expr: PebbleExpr,
        readonly asType: PebbleType,
        readonly range: SourceRange = SourceRange.join( expr.range, asType.range )
    ) {}
}