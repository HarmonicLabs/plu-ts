import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirTypeConversionExpr
    implements ITirExpr
{
    constructor(
        readonly expr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}