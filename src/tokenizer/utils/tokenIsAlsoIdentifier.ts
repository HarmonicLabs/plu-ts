import { Token } from "../Token";

export function tokenIsAlsoIdentifier(token: Token): boolean {
    switch (token) {
        case Token.Abstract:
        case Token.As:
        case Token.Constructor:
        case Token.Declare:
        case Token.Delete:
        case Token.From:
        case Token.For:
        case Token.Get:
        case Token.InstanceOf:
        case Token.Is:
        case Token.KeyOf:
        case Token.Module:
        case Token.Namespace:
        // case Token.Null:
        case Token.Readonly:
        case Token.Set:
        case Token.Type:
        case Token.Void: return true;
        default: return false;
    }
}