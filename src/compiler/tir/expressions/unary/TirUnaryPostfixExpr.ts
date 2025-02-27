import { TirPostfixMinusMinus } from "./TirPrefixMinusMinus";
import { TirPostfixPlusPlus } from "./TirPrefixPlusPlus";

/**
 * TODO:
 * - add postfix exclamation (non null) `!`
 * - add postfix question mark (error as optional) `?`
 *  (NOTE: `?.` (optional chaining) is a different token)
**/
export type TirUnaryPostfixExpr
    = TirPostfixPlusPlus
    | TirPostfixMinusMinus;

export function isTirUnaryPostfixExpr( thing: any ): thing is TirUnaryPostfixExpr
{
    return (
        thing instanceof TirPostfixPlusPlus    ||
        thing instanceof TirPostfixMinusMinus
    );
}