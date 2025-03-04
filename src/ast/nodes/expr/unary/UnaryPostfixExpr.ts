import { Token } from "../../../../tokenizer/Token";
import { SourceRange } from "../../../Source/SourceRange";
import { PebbleExpr } from "../PebbleExpr";
import { NonNullExpr } from "./NonNullExpr";
import { DecrStmt } from "./DecrStmt";
import { IncrStmt } from "../../statements/IncrStmt";

/**
 * TODO:
 * - add postfix question mark (error as optional) `?`
 *  (NOTE: `?.` (optional chaining) is a different token)
**/
export type UnaryPostfixExpr
    = IncrStmt
    | DecrStmt
    | NonNullExpr
    ;

export function isUnaryPostfixExpr( thing: any ): thing is UnaryPostfixExpr
{
    return (
        thing instanceof IncrStmt
        || thing instanceof DecrStmt
        || thing instanceof NonNullExpr
    );
}

export type UnaryPostfixToken
    = Token.Plus_Plus
    | Token.Minus_Minus
    | Token.Exclamation
    ;

export type UnaryPostfixTokenToExpr<T extends UnaryPostfixToken> =
    T extends Token.Plus_Plus ?   IncrStmt :
    T extends Token.Minus_Minus ? DecrStmt :
    T extends Token.Exclamation ? NonNullExpr :
    never;

export function makeUnaryPostfixExpr<T extends UnaryPostfixToken>(
    token: T,
    operand: PebbleExpr,
    range: SourceRange
): UnaryPostfixTokenToExpr<T>
{
    switch( token ) {
        case Token.Plus_Plus: return new IncrStmt( operand, range ) as any;
        case Token.Minus_Minus: return new DecrStmt( operand, range ) as any;
        case Token.Exclamation: return new NonNullExpr( operand, range ) as any;
        default:
            throw new Error( "Invalid token for unary prefix expression" );
    }
}