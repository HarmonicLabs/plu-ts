import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { AstTypeExpr } from "./AstTypeExpr";

/**
 * struct, aliases and respective params
 */
export class AstNamedTypeExpr implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly tyArgs: AstTypeExpr[],
        readonly range: SourceRange
    ) {}
}