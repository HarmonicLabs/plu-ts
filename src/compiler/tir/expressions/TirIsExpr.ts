import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "./TirExpr";


export class TirIsExpr
    implements HasSourceRange
{
    constructor(
        readonly instanceExpr: TirExpr,
        readonly ofType: Identifier,
        readonly range: SourceRange
    ) {}
}