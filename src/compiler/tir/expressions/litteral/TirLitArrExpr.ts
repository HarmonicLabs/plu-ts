import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";
import { ITirExpr } from "../ITirExpr";
import { TirExpr } from "../TirExpr";

export class TirLitArrExpr
    implements ITirExpr
{
    constructor(
        readonly elems: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}
}