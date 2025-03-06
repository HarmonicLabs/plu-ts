import { HasSourceRange } from "../../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../../expressions/TirExpr";
import { TirType } from "../../types/TirType";
import { TirVarDecl } from "./TirVarDecl";

export class TirArrayLikeDeconstr
    implements HasSourceRange
{
    constructor(
        readonly elements: TirVarDecl[],
        readonly rest: string | undefined,
        public type: TirType,
        public initExpr: TirExpr | undefined,
        public flags: number,
        readonly range: SourceRange,
    ) {}
}