import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { AstTypeExpr } from "../types/AstTypeExpr";

export class UsingDecl
    implements HasSourceRange
{
    constructor(
        readonly constructorNames: UsingDeclaredConstructor[],
        readonly structName: Identifier,
        readonly structTypeParams: AstTypeExpr[],
        readonly range: SourceRange
    ) {}
}

export class UsingDeclaredConstructor
    implements HasSourceRange
{
    constructor(
        readonly constructorName: Identifier,
        readonly renamedConstructorName: Identifier | undefined,
        readonly range: SourceRange
    ) {}
}