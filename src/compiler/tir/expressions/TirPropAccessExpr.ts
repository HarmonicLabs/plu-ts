import { isObject } from "@harmoniclabs/obj-utils";
import { TirExpr } from "./TirExpr";
import { Token } from "../../../tokenizer/Token";
import { Identifier } from "../../../ast/nodes/common/Identifier";
import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirCallExpr } from "./TirCallExpr";
import { ITirExpr } from "./ITirExpr";
import { TirType } from "../types/TirType";

export type TirPropAccessExpr
    = TirOptionalPropAccessExpr
    | TirNonNullPropAccessExpr
    | TirDotPropAccessExpr
    ;

export type PropAccessToken
    = Token.Question_Dot
    | Token.Exclamation_Dot
    | Token.Dot
    ;

export type PropAccessTokenToExpr<T extends PropAccessToken> =
    T extends Token.Question_Dot ? TirOptionalPropAccessExpr :
    T extends Token.Exclamation_Dot ? TirNonNullPropAccessExpr :
    T extends Token.Dot ? TirDotPropAccessExpr :
    never;

export function isTirPropAccessExpr( thing: any ): thing is TirPropAccessExpr
{
    return isObject( thing ) && (
        thing instanceof TirOptionalPropAccessExpr
        || thing instanceof TirNonNullPropAccessExpr
        || thing instanceof TirDotPropAccessExpr
    );
}

export class TirOptionalPropAccessExpr
    implements ITirExpr
{
    constructor(
        readonly object: TirExpr,
        readonly prop: Identifier | TirCallExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}

export class TirNonNullPropAccessExpr
    implements ITirExpr
{
    constructor(
        readonly object: TirExpr,
        readonly prop: Identifier | TirCallExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}

export class TirDotPropAccessExpr
    implements ITirExpr
{
    constructor(
        readonly object: TirExpr,
        readonly prop: Identifier | TirCallExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}