import { Token } from "../../tokenizer/Token";

/**
 * Operator precedence from least to largest.
 * 
 * see: http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm#climbing
 * 
 * The idea is that parseExpr(precedence) recognizes expressions 
 * with precedence less than p
 * 
**/
export enum Precedence {
    None,           // No precedence
    Comma,          // ,
    Spread,         // ...
    Assignment,     // = += -= **= *= /= %= <<= >>= >>>= &= ^= |= ??=
    CaseExpr,       // case thing (is pattern => expression)+
    Pipe,           // |> (pipe operator in the future)
    Conditional,    // ? : (ternary)
    LogicalOr,      // || ??
    LogicalAnd,     // &&
    BitwiseOr,      // |
    BitwiseXor,     // ^
    BitwiseAnd,     // &
    Equality,       // == !== === !==
    Relational,     // < > <= >= as in instanceof
    Shift,          // << >> >>>  
    Additive,       // + -
    Multiplicative, // * / %
    Exponentiated,  // **
    UnaryPrefix,    // ++... _ --... !... ~... etc.
    UnaryPostfix,   // ...++ _ ...--
    Call,           // func(...)
    MemberAccess,   // obj.prop | obj?.prop | arr[idx]
    Grouping,       // ( ... )
    Litteral,       // "string", #hex_bytes
}
Object.freeze(Precedence);

/** Determines the precedence of a non-starting token. */
export function determinePrecedence(kind: Token): Precedence
{
    switch( kind ) {
        case Token.Comma: return Precedence.Comma;
        case Token.Dot_Dot_Dot: return Precedence.Spread;
        case Token.Case:
        // TODO: this would be a special case, `is` is used for `case` expressions
        // case Token.Is: return Precedence.CaseExpr;
        case Token.Equals:
        case Token.Plus_Equals:
        case Token.Minus_Equals:
        case Token.Asterisk_Asterisk_Equals:
        case Token.Asterisk_Equals:
        case Token.Slash_Equals:
        case Token.Percent_Equals:
        case Token.LessThan_LessThan_Equals:
        case Token.GreaterThan_GreaterThan_Equals:
        case Token.GreaterThan_GreaterThan_GreaterThan_Equals:
        case Token.Ampersand_Equals:
        case Token.Caret_Equals:
        case Token.Question_Question_Equals:
        case Token.Bar_Equals: return Precedence.Assignment;
        case Token.Question: return Precedence.Conditional;
        case Token.Question_Question: // ?? (null coalescing) same as logical or (left associative)
        case Token.Bar_Bar: return Precedence.LogicalOr;
        case Token.Ampersand_Ampersand: return Precedence.LogicalAnd;
        case Token.Bar: return Precedence.BitwiseOr;
        case Token.Caret: return Precedence.BitwiseXor;
        case Token.Ampersand: return Precedence.BitwiseAnd;
        case Token.Equals_Equals:
        case Token.Exclamation_Equals:
        case Token.Equals_Equals_Equals:
        case Token.Exclamation_Equals_Equals: return Precedence.Equality;
        case Token.As:
        // case Token.In:
        // case Token.InstanceOf:
        case Token.Is: // TODO: `is` keyword is used (with lower precedence) for `case` expressions
        case Token.LessThan:
        case Token.GreaterThan:
        case Token.LessThan_Equals:
        case Token.GreaterThan_Equals: return Precedence.Relational;
        case Token.LessThan_LessThan:
        case Token.GreaterThan_GreaterThan:
        case Token.GreaterThan_GreaterThan_GreaterThan: return Precedence.Shift;
        case Token.Plus:
        case Token.Minus: return Precedence.Additive;
        case Token.Asterisk:
        case Token.Slash:
        case Token.Percent: return Precedence.Multiplicative;
        case Token.Asterisk_Asterisk: return Precedence.Exponentiated;
        case Token.Plus_Plus:
        case Token.Minus_Minus: return Precedence.UnaryPostfix;
        case Token.Dot:
        case Token.Question_Dot:
        case Token.OpenBracket:
        case Token.Exclamation: return Precedence.MemberAccess;
        case Token.HexBytesLiteral: return Precedence.Litteral;
    }
    return Precedence.None;
}