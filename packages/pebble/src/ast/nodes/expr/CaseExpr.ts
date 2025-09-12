import { SourceRange } from "../../Source/SourceRange";
import { VarDecl } from "../statements/declarations/VarDecl/VarDecl";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleExpr } from "./PebbleExpr";

export class CaseExpr
    implements HasSourceRange
{
    constructor(
        public matchExpr: PebbleExpr,
        public cases: CaseExprMatcher[],
        public wildcardCase: CaseWildcardMatcher | undefined,
        readonly range: SourceRange,
    ) {}
}

export class CaseExprMatcher
    implements HasSourceRange
{
    constructor(
        readonly pattern: VarDecl,
        public body: PebbleExpr,
        readonly range: SourceRange,
    ) {}
}

export class CaseWildcardMatcher
    implements HasSourceRange
{
    constructor(
        public body: PebbleExpr,
        readonly range: SourceRange,
    ) {}
}