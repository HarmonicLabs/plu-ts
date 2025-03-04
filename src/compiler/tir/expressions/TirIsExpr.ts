import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { TirExpr } from "./TirExpr";


export class TirIsExpr
    implements HasSourceRange
{
    constructor(
        readonly instanceExpr: TirExpr,
        readonly ofType: Identifier,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}