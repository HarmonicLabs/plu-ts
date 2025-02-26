import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirStmt, TirVarDecl } from "./TirStmt";

/**
 * for( `elemDeclaration` of iterable ) body
 */
export class TirForOfStmt
    implements HasSourceRange
{
    constructor(
        readonly elemDeclaration: TirForOfElemDecl,
        readonly iterable: TirExpr,
        readonly body: TirStmt,
        readonly range: SourceRange,
    ) {}
}

/**
 * just like function parameters
 * destructured elements are moved in the `for...of` body
 * 
 * unlike funciton parameters
 * `for...of` element type is inferred from the iterable
 */
export class TirForOfElemDecl
    implements HasSourceRange
{
    constructor(
        readonly name: string,
        readonly range: SourceRange,
    ) {}
}