import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirUnaryExpression } from "./ITirUnaryExpression";

export class TirUnaryPlus
    implements ITirExpr, ITirUnaryExpression
{
    constructor(
        readonly operand: TirExpr,
        readonly range: SourceRange
    ) {}
}