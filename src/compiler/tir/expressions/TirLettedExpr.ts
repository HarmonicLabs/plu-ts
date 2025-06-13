import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";


export class TirLettedExpr
    implements ITirExpr
{
    get type(): TirType {
        return this.expr.type;
    }

    constructor(
        readonly varName: string,
        public expr: TirExpr,
        readonly range: SourceRange
    ) {}

    deps(): string[] {
        return this.expr.deps();
    }

    unsafeClone(): TirLettedExpr
    {
        return new TirLettedExpr(
            this.varName,
            this.expr, // this.expr.clone(),
            this.range
        );
    }
}