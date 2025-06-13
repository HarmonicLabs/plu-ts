import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";

export class TirFromDataExpr
    implements ITirExpr
{
    constructor(
        public dataExpr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return this.dataExpr.deps();
    }
}