import { PebbleExpr } from "../PebbleExpr";

export interface IUnaryExpression {
    readonly operand: PebbleExpr;
}