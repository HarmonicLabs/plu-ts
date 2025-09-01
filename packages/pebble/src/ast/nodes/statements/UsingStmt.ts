import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { AstTypeExpr } from "../types/AstTypeExpr";

export class UsingStmt
    implements HasSourceRange
{
    constructor(
        readonly constructorNames: UsingStmtDeclaredConstructor[],
        readonly structTypeExpr: AstTypeExpr,
        readonly range: SourceRange
    ) {}
}

export class UsingStmtDeclaredConstructor
    implements HasSourceRange
{
    constructor(
        readonly constructorName: Identifier,
        readonly renamedConstructorName: Identifier | undefined,
        readonly range: SourceRange
    ) {}
}