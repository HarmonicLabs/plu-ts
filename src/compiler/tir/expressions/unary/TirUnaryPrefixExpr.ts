import { UnaryPrefixExpr } from "../../../../ast/nodes/expr/unary/UnaryPrefixExpr";
import { TirPrefixMinusMinus } from "./TirPrefixMinusMinus";
import { TirPrefixPlusPlus } from "./TirPrefixPlusPlus";
import { TirUnaryExclamation } from "./TirUnaryExclamation";
import { TirUnaryMinus } from "./TirUnaryMinus";
import { TirUnaryPlus } from "./TirUnaryPlus";
import { TirUnaryTilde } from "./TirUnaryTilde";

export type TirUnaryPrefixExpr
    = TirUnaryExclamation
    | TirUnaryPlus
    | TirUnaryMinus
    | TirUnaryTilde
    | TirPrefixPlusPlus
    | TirPrefixMinusMinus;

export function isUnaryPrefixExpr( thing: any ): thing is UnaryPrefixExpr
{
    return (
        thing instanceof TirUnaryExclamation   ||
        thing instanceof TirUnaryPlus          ||
        thing instanceof TirUnaryMinus         ||
        thing instanceof TirUnaryTilde         ||
        thing instanceof TirPrefixPlusPlus     ||
        thing instanceof TirPrefixMinusMinus
    );
}