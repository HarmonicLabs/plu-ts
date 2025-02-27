import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { FuncDecl } from "../../statements/declarations/FuncDecl";

export class FuncExpr implements HasSourceRange
{
    constructor(
        readonly decl: FuncDecl,
        readonly range: SourceRange
    ) {}
}