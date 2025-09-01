import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { AstTypeExpr } from "../../types/AstTypeExpr";


export class TypeAliasDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly typeParams: Identifier[],
        readonly aliasedType: AstTypeExpr,
        readonly range: SourceRange,
    ) {}
}