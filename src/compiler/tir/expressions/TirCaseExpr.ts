import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirVarDecl } from "../statements/TirVarDecl/TirVarDecl";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirCaseExpr
    implements ITirExpr
{
    constructor(
        readonly matchExpr: TirExpr,
        readonly cases: TirCaseExprMatcher[],
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}
}

export class TirCaseExprMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: TirVarDecl,
        readonly body: TirExpr,
        readonly range: SourceRange,
    ) {}
}