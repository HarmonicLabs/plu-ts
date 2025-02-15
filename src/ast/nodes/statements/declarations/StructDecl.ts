import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { AstNamedTypeExpr } from "../../types/AstNamedTypeExpr";
import { AstTypeExpr } from "../../types/AstTypeExpr";
import { VarDecl } from "./VarDecl/VarDecl";


export class StructDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: Identifier[],
        readonly constrs: StructConstrDecl[],
        readonly range: SourceRange
    ) {}
}

export class StructConstrDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly fields: VarDecl[],
        readonly range: SourceRange
    ) {}
}