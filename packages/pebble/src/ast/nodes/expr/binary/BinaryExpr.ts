import { isObject } from "@harmoniclabs/obj-utils";
import { Token } from "../../../../tokenizer/Token";
import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleExpr } from "../PebbleExpr";


export type BinaryExpr
    = ExponentiationExpr
    | LessThanExpr
    | GreaterThanExpr
    | LessThanEqualExpr
    | GreaterThanEqualExpr
    | EqualExpr
    | NotEqualExpr
    | AddExpr
    | SubExpr
    | MultExpr
    | DivExpr
    | ModuloExpr
    | ShiftLeftExpr
    | ShiftRightExpr
    | BitwiseAndExpr
    | BitwiseXorExpr
    | BitwiseOrExpr
    | LogicalAndExpr
    | LogicalOrExpr
    | OptionalDefaultExpr
    ;

export type BinaryExprToken
    = Token.Asterisk_Asterisk
    | Token.LessThan
    | Token.GreaterThan
    | Token.LessThan_Equals
    | Token.GreaterThan_Equals
    | Token.Equals_Equals
    | Token.Equals_Equals_Equals
    | Token.Exclamation_Equals_Equals
    | Token.Exclamation_Equals
    | Token.Plus
    | Token.Minus
    | Token.Asterisk
    | Token.Slash
    | Token.Percent
    | Token.LessThan_LessThan
    | Token.GreaterThan_GreaterThan
    | Token.GreaterThan_GreaterThan_GreaterThan
    | Token.Ampersand
    | Token.Bar
    | Token.Caret
    | Token.Ampersand_Ampersand
    | Token.Question_Question
    | Token.Bar_Bar
    ;

export type BinaryTokenToExpr<T extends BinaryExprToken> =
    T extends Token.Asterisk_Asterisk ? ExponentiationExpr :
    T extends Token.LessThan ? LessThanExpr :
    T extends Token.GreaterThan ? GreaterThanExpr :
    T extends Token.LessThan_Equals ? LessThanEqualExpr :
    T extends Token.GreaterThan_Equals ? GreaterThanEqualExpr :
    T extends Token.Equals_Equals ? EqualExpr :
    T extends Token.Equals_Equals_Equals ? EqualExpr :
    T extends Token.Exclamation_Equals_Equals ? NotEqualExpr :
    T extends Token.Exclamation_Equals ? NotEqualExpr :
    T extends Token.Plus ? AddExpr :
    T extends Token.Minus ? SubExpr :
    T extends Token.Asterisk ? MultExpr :
    T extends Token.Slash ? DivExpr :
    T extends Token.Percent ? ModuloExpr :
    T extends Token.LessThan_LessThan ? ShiftLeftExpr :
    T extends Token.GreaterThan_GreaterThan ? ShiftRightExpr :
    T extends Token.GreaterThan_GreaterThan_GreaterThan ? ShiftRightExpr :
    T extends Token.Ampersand ? BitwiseAndExpr :
    T extends Token.Caret ? BitwiseXorExpr :
    T extends Token.Bar ? BitwiseOrExpr :
    T extends Token.Ampersand_Ampersand ? LogicalAndExpr :
    T extends Token.Bar_Bar ? LogicalOrExpr :
    T extends Token.Question_Question ? OptionalDefaultExpr :
    never;

export function makeBinaryExpr<T extends BinaryExprToken>(
    token: T,
    left: PebbleExpr,
    right: PebbleExpr,
    range: SourceRange
): BinaryTokenToExpr<T>
{
    switch( token ) {
        case Token.Asterisk_Asterisk: return new ExponentiationExpr( left, right, range ) as any;
        case Token.LessThan: return new LessThanExpr( left, right, range ) as any;
        case Token.GreaterThan: return new GreaterThanExpr( left, right, range ) as any;
        case Token.LessThan_Equals: return new LessThanEqualExpr( left, right, range ) as any;
        case Token.GreaterThan_Equals: return new GreaterThanEqualExpr( left, right, range ) as any;
        case Token.Equals_Equals: return new EqualExpr( left, right, range ) as any;
        case Token.Equals_Equals_Equals: return new EqualExpr( left, right, range ) as any;
        case Token.Exclamation_Equals_Equals: return new NotEqualExpr( left, right, range ) as any;
        case Token.Exclamation_Equals: return new NotEqualExpr( left, right, range ) as any;
        case Token.Plus: return new AddExpr( left, right, range ) as any;
        case Token.Minus: return new SubExpr( left, right, range ) as any;
        case Token.Asterisk: return new MultExpr( left, right, range ) as any;
        case Token.Slash: return new DivExpr( left, right, range ) as any;
        case Token.Percent: return new ModuloExpr( left, right, range ) as any;
        case Token.LessThan_LessThan: return new ShiftLeftExpr( left, right, range ) as any;
        case Token.GreaterThan_GreaterThan: return new ShiftRightExpr( left, right, range ) as any;
        case Token.GreaterThan_GreaterThan_GreaterThan: return new ShiftRightExpr( left, right, range ) as any;
        case Token.Ampersand: return new BitwiseAndExpr( left, right, range ) as any;
        case Token.Caret: return new BitwiseXorExpr( left, right, range ) as any;
        case Token.Bar: return new BitwiseOrExpr( left, right, range ) as any;
        case Token.Ampersand_Ampersand: return new LogicalAndExpr( left, right, range ) as any;
        case Token.Bar_Bar: return new LogicalOrExpr( left, right, range ) as any;
        case Token.Question_Question: return new OptionalDefaultExpr( left, right, range ) as any;
        default:
            throw new Error( "Invalid token for binary expression" );
    }
}

export function isBinaryExpr( thing: any ): thing is BinaryExpr
{
    return isObject( thing ) && (
        thing instanceof ExponentiationExpr
        || thing instanceof LessThanExpr
        || thing instanceof GreaterThanExpr
        || thing instanceof LessThanEqualExpr
        || thing instanceof GreaterThanEqualExpr
        || thing instanceof EqualExpr
        || thing instanceof NotEqualExpr
        || thing instanceof AddExpr
        || thing instanceof SubExpr
        || thing instanceof MultExpr
        || thing instanceof DivExpr
        || thing instanceof ModuloExpr
        || thing instanceof ShiftLeftExpr
        || thing instanceof ShiftRightExpr
        || thing instanceof BitwiseAndExpr
        || thing instanceof BitwiseXorExpr
        || thing instanceof BitwiseOrExpr
        || thing instanceof LogicalAndExpr
        || thing instanceof LogicalOrExpr
        || thing instanceof OptionalDefaultExpr
    );
}

export interface IBinaryExpr extends HasSourceRange
{
    readonly left: PebbleExpr;
    readonly right: PebbleExpr;
}

export class ExponentiationExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class LessThanExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class GreaterThanExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class LessThanEqualExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class GreaterThanEqualExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class EqualExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class NotEqualExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class AddExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class SubExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class MultExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class DivExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ModuloExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ShiftLeftExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ShiftRightExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class BitwiseAndExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class BitwiseXorExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class BitwiseOrExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class LogicalAndExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class LogicalOrExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class OptionalDefaultExpr
    implements IBinaryExpr
{
    constructor(
        readonly left: PebbleExpr,
        readonly right: PebbleExpr,
        readonly range: SourceRange
    ) {}
}