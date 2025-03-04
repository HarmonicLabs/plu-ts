import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirUnaryExpression } from "./ITirUnaryExpression";
import { TirType } from "../../types/TirType";

export class TirUnaryExclamation
    implements ITirExpr, ITirUnaryExpression
{
    constructor(
        readonly operand: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}