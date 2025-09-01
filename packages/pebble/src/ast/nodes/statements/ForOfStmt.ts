import { PebbleAst } from "../../PebbleAst";
import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { VarDecl } from "./declarations/VarDecl/VarDecl";
import { VarStmt } from "./VarStmt";

/**
 * for( `elemDeclaration` of iterable ) body
 */
export class ForOfStmt
    implements HasSourceRange
{
    constructor(
        readonly elemDeclaration: VarStmt<[VarDecl]>,
        readonly iterable: PebbleExpr,
        readonly body: PebbleAst,
        readonly range: SourceRange,
    ) {}
}