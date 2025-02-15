import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { AstTypeExpr } from "./AstTypeExpr";

export class AstNamedTypeExpr implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly tyArgs: AstTypeExpr[],
        readonly range: SourceRange
    ) {}
}