import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirUnaryExpression } from "./ITirUnaryExpression";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";

export class TirUnaryExclamation
    implements ITirExpr, ITirUnaryExpression
{
    constructor(
        readonly operand: TirExpr,
        readonly type: PebbleConcreteTypeSym,
        readonly range: SourceRange
    ) {}
}