import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";

export class TirLitThisExpr implements ITirExpr
{
    constructor(
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}