import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleAstType } from "../types/PebbleAstType";
import { PebbleExpr } from "./PebbleExpr";


export class TypeConversionExpr
    implements HasSourceRange
{
    constructor(
        readonly expr: PebbleExpr,
        readonly asType: PebbleAstType,
        readonly range: SourceRange = SourceRange.join( expr.range, asType.range )
    ) {}
}