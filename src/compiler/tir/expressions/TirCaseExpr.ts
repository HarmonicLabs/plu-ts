import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { VarDecl } from "../../../ast/nodes/statements/declarations/VarDecl/VarDecl";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "./TirExpr";

export class TirCaseExpr
    implements HasSourceRange
{
    constructor(
        readonly matchExpr: TirExpr,
        readonly cases: TirCaseExprMatcher[],
        readonly range: SourceRange,
    ) {}
}

export class TirCaseExprMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: VarDecl,
        readonly body: TirExpr,
        readonly range: SourceRange,
    ) {}
}