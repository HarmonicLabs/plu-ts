import { isObject } from "@harmoniclabs/obj-utils";
import { TirExpr } from "../TirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { ITirExpr } from "../ITirExpr";
import { TirType } from "../../types/TirType";
import { bool_t, bytes_t, int_t } from "../../program/stdScope/stdScope";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";


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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
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

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
}