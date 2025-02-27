import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirFuncDecl } from "../statements/TirFuncDecl";

export class TirFuncExpr implements HasSourceRange
{
    constructor(
        readonly decl: TirFuncDecl,
        readonly range: SourceRange
    ) {}
}