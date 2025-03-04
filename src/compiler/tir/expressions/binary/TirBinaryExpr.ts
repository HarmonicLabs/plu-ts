import { isObject } from "@harmoniclabs/obj-utils";
import { TirExpr } from "../TirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { HasSourceRange } from "../../../../ast/nodes/HasSourceRange";
import { ITirExpr } from "../ITirExpr";
import { TirType } from "../../types/TirType";
import { bool_t, bytes_t, int_t } from "../../../AstCompiler/scope/stdScope/stdScope";


export type TirBinaryExpr
    = TirExponentiationExpr
    | TirLessThanExpr
    | TirGreaterThanExpr
    | TirLessThanEqualExpr
    | TirGreaterThanEqualExpr
    | TirEqualExpr
    | TirNotEqualExpr
    | TirAddExpr
    | TirSubExpr
    | TirMultExpr
    | TirDivExpr
    | TirModuloExpr 
    | TirShiftLeftExpr
    | TirShiftRightExpr
    | TirBitwiseAndExpr
    | TirBitwiseXorExpr
    | TirBitwiseOrExpr
    | TirLogicalAndExpr
    | TirLogicalOrExpr
    | TirOptionalDefaultExpr
    ;

export function isTirBinaryExpr( thing: any ): thing is TirBinaryExpr
{
    return isObject( thing ) && (
        thing instanceof TirExponentiationExpr
        || thing instanceof TirLessThanExpr
        || thing instanceof TirGreaterThanExpr
        || thing instanceof TirLessThanEqualExpr
        || thing instanceof TirGreaterThanEqualExpr
        || thing instanceof TirEqualExpr
        || thing instanceof TirNotEqualExpr
        || thing instanceof TirAddExpr
        || thing instanceof TirSubExpr
        || thing instanceof TirMultExpr
        || thing instanceof TirDivExpr 
        || thing instanceof TirModuloExpr
        || thing instanceof TirShiftLeftExpr
        || thing instanceof TirShiftRightExpr
        || thing instanceof TirBitwiseAndExpr
        || thing instanceof TirBitwiseXorExpr
        || thing instanceof TirBitwiseOrExpr
        || thing instanceof TirLogicalAndExpr
        || thing instanceof TirLogicalOrExpr
        || thing instanceof TirOptionalDefaultExpr
    );
}

export interface ITirBinaryExpr extends ITirExpr
{
    readonly left: TirExpr;
    readonly right: TirExpr;
}

export class TirExponentiationExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirLessThanExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirGreaterThanExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirLessThanEqualExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirGreaterThanEqualExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirEqualExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirNotEqualExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirAddExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirSubExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirMultExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirDivExpr 
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirModuloExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirShiftLeftExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bytes_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirShiftRightExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bytes_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirBitwiseAndExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bytes_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirBitwiseXorExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bytes_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirBitwiseOrExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bytes_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirLogicalAndExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

export class TirLogicalOrExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = bool_t;
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly range: SourceRange
    ) {}
}

/** `??` */
export class TirOptionalDefaultExpr
    implements ITirBinaryExpr
{
    constructor(
        readonly left: TirExpr,
        readonly right: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}