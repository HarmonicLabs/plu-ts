import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { VarDecl } from "../../../ast/nodes/statements/declarations/VarDecl/VarDecl";
import { SourceRange } from "../../../ast/Source/SourceRange";
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
        readonly pattern: VarDecl,
        readonly body: TirExpr,
        readonly range: SourceRange,
    ) {}
}