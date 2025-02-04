import { Token } from "../../../../tokenizer/Token";
import { SourceRange } from "../../../Source/SourceRange";
import { PebbleExpr } from "../PebbleExpr";
import { PostfixMinusMinus } from "./PrefixMinusMinus";
import { PostfixPlusPlus } from "./PrefixPlusPlus";

export type UnaryPostfixExpr
    = PostfixPlusPlus
    | PostfixMinusMinus;

export function isUnaryPostfixExpr( thing: any ): thing is UnaryPostfixExpr
{
    return (
        thing instanceof PostfixPlusPlus    ||
        thing instanceof PostfixMinusMinus
    );
}

export type UnaryPostfixToken
    = Token.Plus_Plus
    | Token.Minus_Minus;

export type UnaryPostfixTokenToExpr<T extends UnaryPostfixToken> =
    T extends Token.Plus_Plus ?   PostfixPlusPlus :
    T extends Token.Minus_Minus ? PostfixMinusMinus :
    never;

export function makeUnaryPostfixExpr<T extends UnaryPostfixToken>(
    token: T,
    operand: PebbleExpr,
    range: SourceRange
): UnaryPostfixTokenToExpr<T>
{
    switch( token ) {
        case Token.Plus_Plus: return new PostfixPlusPlus( operand, range ) as any;
        case Token.Minus_Minus: return new PostfixMinusMinus( operand, range ) as any;
        default:
            throw new Error( "Invalid token for unary prefix expression" );
    }
}