import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirStmt } from "./TirStmt";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

/**
 * for( `elemDeclaration` of iterable ) body
 */
export class TirForOfStmt
    implements HasSourceRange
{
    constructor(
        readonly elemDeclaration: TirVarDecl,
        readonly iterable: TirExpr,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}
}