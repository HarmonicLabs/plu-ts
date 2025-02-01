import { Token } from "../../../../tokenizer/Token";
import { SourceRange } from "../../../Source/SourceRange";
import { PebbleExpr } from "../PebbleExpr";
import { PrefixMinusMinus } from "./PrefixMinusMinus";
import { PrefixPlusPlus } from "./PrefixPlusPlus";
import { UnaryExclamation } from "./UnaryExclamation";
import { UnaryMinus } from "./UnaryMinus";
import { UnaryPlus } from "./UnaryPlus";
import { UnaryTilde } from "./UnaryTilde";

export type UnaryPrefixExpr
    = UnaryExclamation
    | UnaryPlus
    | UnaryMinus
    | UnaryTilde
    | PrefixPlusPlus
    | PrefixMinusMinus;

export function isUnaryPrefixExpr( thing: any ): thing is UnaryPrefixExpr
{
    return (
        thing instanceof UnaryExclamation   ||
        thing instanceof UnaryPlus          ||
        thing instanceof UnaryMinus         ||
        thing instanceof UnaryTilde         ||
        thing instanceof PrefixPlusPlus     ||
        thing instanceof PrefixMinusMinus
    );
}

export type UnaryPrefixToken
    = Token.Exclamation
    | Token.Plus
    | Token.Minus
    | Token.Tilde
    | Token.Plus_Plus
    | Token.Minus_Minus;

export type UnaryPrefixTokenToExpr<T extends UnaryPrefixToken> =
    T extends Token.Exclamation ? UnaryExclamation :
    T extends Token.Plus ? UnaryPlus :
    T extends Token.Minus ? UnaryMinus :
    T extends Token.Tilde ? UnaryTilde :
    T extends Token.Plus_Plus ? PrefixPlusPlus :
    T extends Token.Minus_Minus ? PrefixMinusMinus :
    never;

export function makeUnaryPrefixExpr<T extends UnaryPrefixToken>(
    token: T,
    operand: PebbleExpr,
    range: SourceRange
): UnaryPrefixTokenToExpr<T>
{
    switch( token ) {
        case Token.Exclamation: return new UnaryExclamation( operand, range ) as any;
        case Token.Plus: return new UnaryPlus( operand, range ) as any;
        case Token.Minus: return new UnaryMinus( operand, range ) as any;
        case Token.Tilde: return new UnaryTilde( operand, range ) as any;
        case Token.Plus_Plus: return new PrefixPlusPlus( operand, range ) as any;
        case Token.Minus_Minus: return new PrefixMinusMinus( operand, range ) as any;
        default:
            throw new Error( "Invalid token for unary prefix expression" );
    }
}