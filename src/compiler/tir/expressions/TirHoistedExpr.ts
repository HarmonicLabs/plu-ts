import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";


export class TirHoistedExpr
    implements ITirExpr
{
    get type(): TirType {
        return this.expr.type;
    }

    get range(): SourceRange {
        return this.expr.range;
    }

    constructor(
        readonly varName: string,
        public expr: TirExpr
    ) {}

    deps(): string[] {
        return this.expr.deps();
    }

    unsafeClone(): TirHoistedExpr
    {
        return new TirHoistedExpr(
            this.varName,
            this.expr, // this.expr.clone(),
        );
    }
}