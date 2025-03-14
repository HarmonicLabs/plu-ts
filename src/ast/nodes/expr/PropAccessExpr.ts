import { isObject } from "@harmoniclabs/obj-utils";
import { HasSourceRange } from "../HasSourceRange";
import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "./PebbleExpr";
import { Identifier } from "../common/Identifier";
import { CallExpr } from "./functions/CallExpr";
import { Token } from "../../../tokenizer/Token";

export type PropAccessExpr
    = OptionalPropAccessExpr
    | NonNullPropAccessExpr
    | DotPropAccessExpr
    ;

export type PropAccessToken
    = Token.Question_Dot
    | Token.Exclamation_Dot
    | Token.Dot
    ;

export type PropAccessTokenToExpr<T extends PropAccessToken> =
    T extends Token.Question_Dot ? OptionalPropAccessExpr :
    T extends Token.Exclamation_Dot ? NonNullPropAccessExpr :
    T extends Token.Dot ? DotPropAccessExpr :
    never;

export function makePropAccessExpr<T extends PropAccessToken>(
    token: T,
    object: PebbleExpr,
    prop: Identifier,
    range: SourceRange
): PropAccessTokenToExpr<T>
{
    switch( token ) {
        case Token.Question_Dot: return new OptionalPropAccessExpr( object, prop, range ) as any;
        case Token.Exclamation_Dot: return new NonNullPropAccessExpr( object, prop, range ) as any;
        case Token.Dot: return new DotPropAccessExpr( object, prop, range ) as any;
        default:
            throw new Error( "Invalid token for property access expression" );
    }
}

export function isPropAccessExpr( thing: any ): thing is PropAccessExpr
{
    return isObject( thing ) && (
        thing instanceof OptionalPropAccessExpr
        || thing instanceof NonNullPropAccessExpr
        || thing instanceof DotPropAccessExpr
    );
}

export class OptionalPropAccessExpr
    implements HasSourceRange
{
    constructor(
        readonly object: PebbleExpr,
        readonly prop: Identifier,
        readonly range: SourceRange
    ) {}
}

export class NonNullPropAccessExpr
    implements HasSourceRange
{
    constructor(
        readonly object: PebbleExpr,
        readonly prop: Identifier,
        readonly range: SourceRange
    ) {}
}

export class DotPropAccessExpr
    implements HasSourceRange
{
    constructor(
        readonly object: PebbleExpr,
        readonly prop: Identifier,
        readonly range: SourceRange
    ) {}
}