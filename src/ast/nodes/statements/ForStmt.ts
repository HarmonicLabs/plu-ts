import { PebbleAst } from "../../PebbleAst";
import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";

/**
 * ***NOT*** for...of loop
 * 
 * for( init; condition; update ) body
 */
export class ForStmt
    implements HasSourceRange
{
    constructor(
        readonly init: PebbleAst,
        readonly condition: PebbleExpr,
        readonly update: PebbleAst,
        readonly body: PebbleAst,
        readonly range: SourceRange,
    ) {}
}