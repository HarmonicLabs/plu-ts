import { isObject } from "@harmoniclabs/obj-utils";
import { Token } from "../../../tokenizer/Token";
import { Identifier } from "../common/Identifier";
import { PebbleExpr } from "../expr/PebbleExpr";
import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { DecrStmt } from "./DecrStmt";
import { IncrStmt } from "./IncrStmt";


// | AssignmentPattern
export type ExplicitAssignmentStmt
    = SimpleAssignmentStmt
    // int
    | AddAssignmentStmt
    | SubAssignmentStmt
    | ExpAssignmentStmt
    | MultAssignmentStmt
    | DivAssignmentStmt
    | ModuloAssignmentStmt
    // bytes
    | ShiftLeftAssignmentStmt
    | ShiftRightAssignmentStmt
    | BitwiseAndAssignmentStmt
    | BitwiseXorAssignmentStmt
    | BitwiseOrAssignmentStmt
    // boolean
    | LogicalAndAssignmentStmt
    | LogicalOrAssignmentStmt
    ;

export type ImplicitAssignmentStmt
    = IncrStmt
    | DecrStmt
    ;

export type AssignmentStmt
    = ExplicitAssignmentStmt
    | ImplicitAssignmentStmt
    ;


export type AssignmentStmtToken
    = Token.Equals
    | Token.Plus_Equals
    | Token.Minus_Equals
    | Token.Asterisk_Asterisk_Equals
    | Token.Asterisk_Equals
    | Token.Slash_Equals
    | Token.Percent_Equals
    | Token.Plus_Plus
    | Token.Minus_Minus
    | Token.LessThan_LessThan_Equals
    | Token.GreaterThan_GreaterThan_Equals
    | Token.GreaterThan_GreaterThan_GreaterThan_Equals
    | Token.Ampersand_Equals
    | Token.Caret_Equals
    | Token.Bar_Equals
    | Token.Ampersand_Ampersand_Equals
    | Token.Bar_Bar_Equals
    // | Token.Question_Question_Equals
    ;

export type AssignmentTokenToStmt<T extends AssignmentStmtToken> =
    T extends Token.Equals ? SimpleAssignmentStmt :
    T extends Token.Plus_Equals ? AddAssignmentStmt :
    T extends Token.Minus_Equals ? SubAssignmentStmt :
    T extends Token.Asterisk_Asterisk_Equals ? ExpAssignmentStmt :
    T extends Token.Asterisk_Equals ? MultAssignmentStmt :
    T extends Token.Slash_Equals ? DivAssignmentStmt :
    T extends Token.Percent_Equals ? ModuloAssignmentStmt :
    T extends Token.Plus_Plus ? IncrStmt :
    T extends Token.Minus_Minus ? DecrStmt :
    T extends Token.LessThan_LessThan_Equals ? ShiftLeftAssignmentStmt :
    T extends Token.GreaterThan_GreaterThan_Equals ? ShiftRightAssignmentStmt :
    T extends Token.GreaterThan_GreaterThan_GreaterThan_Equals ? ShiftRightAssignmentStmt :
    T extends Token.Ampersand_Equals ? BitwiseAndAssignmentStmt :
    T extends Token.Caret_Equals ? BitwiseXorAssignmentStmt :
    T extends Token.Bar_Equals ? BitwiseOrAssignmentStmt :
    T extends Token.Ampersand_Ampersand_Equals ? LogicalAndAssignmentStmt :
    T extends Token.Bar_Bar_Equals ? LogicalOrAssignmentStmt :
    never; 

export function isAssignmentToken( token: any ): token is AssignmentStmtToken
{
    return token === Token.Equals
        || token === Token.Plus_Equals
        || token === Token.Minus_Equals
        || token === Token.Asterisk_Asterisk_Equals
        || token === Token.Asterisk_Equals
        || token === Token.Slash_Equals
        || token === Token.Percent_Equals
        || token === Token.Plus_Plus
        || token === Token.Minus_Minus
        || token === Token.LessThan_LessThan_Equals
        || token === Token.GreaterThan_GreaterThan_Equals
        || token === Token.GreaterThan_GreaterThan_GreaterThan_Equals
        || token === Token.Ampersand_Equals
        || token === Token.Caret_Equals
        || token === Token.Bar_Equals
        || token === Token.Ampersand_Ampersand_Equals
        || token === Token.Bar_Bar_Equals;
}

export function isAssignmentStmt( stmt: any ): stmt is AssignmentStmt
{
    return isImplicitAssignmentStmt( stmt )
        || isExplicitAssignmentStmt( stmt )
        ;
}

export function isImplicitAssignmentStmt( stmt: any ): stmt is ImplicitAssignmentStmt
{
    return isObject( stmt ) && (
        stmt instanceof IncrStmt
        || stmt instanceof DecrStmt
    );
}

export function isExplicitAssignmentStmt( stmt: any ): stmt is ExpAssignmentStmt
{
    return isObject( stmt ) && (
           stmt instanceof SimpleAssignmentStmt
        || stmt instanceof AddAssignmentStmt
        || stmt instanceof SubAssignmentStmt
        || stmt instanceof ExpAssignmentStmt
        || stmt instanceof MultAssignmentStmt
        || stmt instanceof DivAssignmentStmt
        || stmt instanceof ModuloAssignmentStmt
        // || stmt instanceof IncrStmt
        // || stmt instanceof DecrStmt
        || stmt instanceof ShiftLeftAssignmentStmt
        || stmt instanceof ShiftRightAssignmentStmt
        || stmt instanceof BitwiseAndAssignmentStmt
        || stmt instanceof BitwiseXorAssignmentStmt
        || stmt instanceof BitwiseOrAssignmentStmt
        || stmt instanceof LogicalAndAssignmentStmt
        || stmt instanceof LogicalOrAssignmentStmt
    );
}

export function makeAssignmentStmt<T extends AssignmentStmtToken>(
    varIdentifier: Identifier,
    token: T,
    assignedExpr: PebbleExpr,
    range: SourceRange
): AssignmentTokenToStmt<T>
{
    switch( token )
    {
        case Token.Equals: return new SimpleAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Plus_Equals: return new AddAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Minus_Equals: return new SubAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Asterisk_Asterisk_Equals: return new ExpAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Asterisk_Equals: return new MultAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Slash_Equals: return new DivAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Percent_Equals: return new ModuloAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Plus_Plus: return new IncrStmt( varIdentifier, range ) as any;
        case Token.Minus_Minus: return new DecrStmt( varIdentifier, range ) as any;
        case Token.LessThan_LessThan_Equals: return new ShiftLeftAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.GreaterThan_GreaterThan_Equals: return new ShiftRightAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.GreaterThan_GreaterThan_GreaterThan_Equals: return new ShiftRightAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Ampersand_Equals: return new BitwiseAndAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Caret_Equals: return new BitwiseXorAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Bar_Equals: return new BitwiseOrAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Ampersand_Ampersand_Equals: return new LogicalAndAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        case Token.Bar_Bar_Equals: return new LogicalOrAssignmentStmt( varIdentifier, assignedExpr, range ) as any;
        default: throw new Error( `Invalid assignment token: ${ token }` );
    }
}

export interface IAssignmentStmt extends HasSourceRange {
    readonly varIdentifier: Identifier;
    // readonly token: AssignmentStmtToken;
    readonly assignedExpr: PebbleExpr;
}

export class SimpleAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class AddAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class SubAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ExpAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class MultAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class DivAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ModuloAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ShiftLeftAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class ShiftRightAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class BitwiseAndAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class BitwiseXorAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class BitwiseOrAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class LogicalAndAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}

export class LogicalOrAssignmentStmt
    implements IAssignmentStmt
{
    constructor(
        readonly varIdentifier: Identifier,
        readonly assignedExpr: PebbleExpr,
        readonly range: SourceRange
    ) {}
}