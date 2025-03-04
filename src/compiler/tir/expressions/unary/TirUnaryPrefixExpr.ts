import { TirUnaryExclamation } from "./TirUnaryExclamation";
import { TirUnaryMinus } from "./TirUnaryMinus";
import { TirUnaryPlus } from "./TirUnaryPlus";
import { TirUnaryTilde } from "./TirUnaryTilde";

export type TirUnaryPrefixExpr
    = TirUnaryExclamation
    | TirUnaryPlus
    | TirUnaryMinus
    | TirUnaryTilde

export function isTirUnaryPrefixExpr( thing: any ): thing is TirUnaryPrefixExpr
{
    return (
        thing instanceof TirUnaryExclamation   ||
        thing instanceof TirUnaryPlus          ||
        thing instanceof TirUnaryMinus         ||
        thing instanceof TirUnaryTilde
    );
}