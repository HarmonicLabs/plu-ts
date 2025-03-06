import { HasSourceRange } from "../../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { CommonFlags } from "../../../../common";
import { TirExpr } from "../../expressions/TirExpr";
import { TirType } from "../../types/TirType";
import { TirVarDecl } from "./TirVarDecl";

export class TirSingleDeconstructVarDecl
    implements HasSourceRange
{
    constructor(
        readonly fields: Map<string, TirVarDecl>,
        readonly rest: string | undefined,
        readonly type: TirType,
        public initExpr: TirExpr | undefined,
        public flags: CommonFlags,
        readonly range: SourceRange,
    ) {}
}