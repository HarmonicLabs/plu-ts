import { SourceRange } from "../../Source/SourceRange";
import { VarDecl } from "../statements/declarations/VarDecl/VarDecl";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class CaseExpr
    implements HasSourceRange
{
    constructor(
        readonly matchExpr: PebbleExpr,
        readonly cases: CaseExprMatcher[],
        readonly wildcardCase: CaseWildcardMatcher | undefined,
        readonly range: SourceRange,
    ) {}
}

export class CaseExprMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: VarDecl,
        readonly body: PebbleExpr,
        readonly range: SourceRange,
    ) {}
}

export class CaseWildcardMatcher
    implements HasSourceRange
{
    constructor(
        readonly body: PebbleExpr,
        readonly range: SourceRange,
    ) {}
}