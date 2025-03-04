import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirStmt } from "./TirStmt";
import { TirVarDecl } from "./TirVarDecl/TirVarDecl";

/**
 * ***NOT*** for...of loop
 * 
 * for( init; condition; update ) body
 */
export class TirForStmt
    implements HasSourceRange
{
    constructor(
        readonly init: TirVarDecl[],
        readonly condition: TirExpr | undefined,
        readonly update: TirStmt[] | undefined,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}
}