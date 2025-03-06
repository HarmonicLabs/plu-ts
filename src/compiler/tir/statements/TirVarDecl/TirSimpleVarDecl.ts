import { HasSourceRange } from "../../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../../expressions/TirExpr";
import { TirType } from "../../types/TirType";

export class TirSimpleVarDecl
    implements HasSourceRange
{
    constructor(
        readonly name: string,
        readonly type: TirType,
        readonly initExpr: TirExpr | undefined, // deconstructed OR function param
        readonly range: SourceRange,
    ) {}
}