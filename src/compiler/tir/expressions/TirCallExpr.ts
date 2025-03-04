import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirCallExpr implements ITirExpr
{
    constructor(
        readonly func: TirExpr,
        readonly args: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}