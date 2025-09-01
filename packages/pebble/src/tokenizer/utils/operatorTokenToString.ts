import { Token } from "../Token";

export function operatorTokenToString(token: Token): string {
    switch (token) {
        // case Token.Delete: return "delete";
        // case Token.In: return "in";
        // case Token.InstanceOf: return "instanceof";
        case Token.Is: return "is";
        // case Token.New: return "new";
        // case Token.TypeOf: return "typeof";
        case Token.Void: return "void";
        // case Token.Yield: return "yield";
        case Token.Dot_Dot_Dot: return "...";
        case Token.Comma: return ",";
        case Token.LessThan: return "<";
        case Token.GreaterThan: return ">";
        case Token.LessThan_Equals: return "<=";
        case Token.GreaterThan_Equals: return ">=";
        case Token.Equals_Equals: return "==";
        case Token.Exclamation_Equals: return "!=";
        case Token.Equals_Equals_Equals: return "===";
        case Token.Exclamation_Equals_Equals: return "!==";
        case Token.Plus: return "+";
        case Token.Minus: return "-";
        case Token.Asterisk_Asterisk: return "**";
        case Token.Asterisk: return "*";
        case Token.Slash: return "/";
        case Token.Percent: return "%";
        case Token.Plus_Plus: return "++";
        case Token.Minus_Minus: return "--";
        case Token.LessThan_LessThan: return "<<";
        case Token.GreaterThan_GreaterThan: return ">>";
        case Token.GreaterThan_GreaterThan_GreaterThan: return ">>>";
        case Token.Ampersand: return "&";
        case Token.Bar: return "|";
        case Token.Caret: return "^";
        case Token.Exclamation: return "!";
        case Token.Tilde: return "~";
        case Token.Ampersand_Ampersand: return "&&";
        case Token.Bar_Bar: return "||";
        case Token.Equals: return "=";
        case Token.Plus_Equals: return "+=";
        case Token.Minus_Equals: return "-=";
        case Token.Asterisk_Equals: return "*=";
        case Token.Asterisk_Asterisk_Equals: return "**=";
        case Token.Slash_Equals: return "/=";
        case Token.Percent_Equals: return "%=";
        case Token.LessThan_LessThan_Equals: return "<<=";
        case Token.GreaterThan_GreaterThan_Equals: return ">>=";
        case Token.GreaterThan_GreaterThan_GreaterThan_Equals: return ">>>=";
        case Token.Ampersand_Equals: return "&=";
        case Token.Bar_Equals: return "|=";
        case Token.Caret_Equals: return "^=";
        default: {
            throw new Error(`Unexpected operator token: ${Token[token]}`);
        }
    }
}