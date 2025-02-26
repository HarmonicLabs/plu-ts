import { HasSourceRange } from "../../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../../expressions/TirExpr";
import { TirConcreteType } from "../../types/TirConcreteType";

export class TirNamedDeconstructVarDecl
    implements HasSourceRange
{
    constructor(
        readonly name: string,
        readonly type: TirConcreteType,
        readonly initExpr: TirExpr,
        readonly range: SourceRange,
    ) {}
}