import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";


/**
 * `arrLikeExpr[ indexExpr ]`
 */
export class ElemAccessExpr
    implements HasSourceRange
{
    constructor(
        public arrLikeExpr: PebbleExpr,
        public indexExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}