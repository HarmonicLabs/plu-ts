import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleAstType } from "../types/PebbleAstType";
import { PebbleExpr } from "./PebbleExpr";


/**
 * `arrLikeExpr[ indexExpr ]`
 */
export class ElemAccessExpr
    implements HasSourceRange
{
    constructor(
        readonly arrLikeExpr: PebbleExpr,
        readonly indexExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}