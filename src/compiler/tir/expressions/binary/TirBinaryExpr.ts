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
    ;

export function isTirBinaryExpr( thing: any ): thing is TirBinaryExpr
{
    return isObject( thing ) && (
        thing instanceof TirExponentiationExpr // int
        || thing instanceof TirLessThanExpr // bool
        || thing instanceof TirGreaterThanExpr // bool
        || thing instanceof TirLessThanEqualExpr // bool
        || thing instanceof TirGreaterThanEqualExpr // bool
        || thing instanceof TirEqualExpr // bool
        || thing instanceof TirNotEqualExpr // bool
        || thing instanceof TirAddExpr // int
        || thing instanceof TirSubExpr // int
        || thing instanceof TirMultExpr // int
        || thing instanceof TirDivExpr // int
        || thing instanceof TirModuloExpr // int
        || thing instanceof TirShiftLeftExpr // bytes
        || thing instanceof TirShiftRightExpr // bytes
        || thing instanceof TirBitwiseAndExpr // bytes
        || thing instanceof TirBitwiseXorExpr // bytes
        || thing instanceof TirBitwiseOrExpr // bytes
        || thing instanceof TirLogicalAndExpr // bool
        || thing instanceof TirLogicalOrExpr // bool
    );
}

export interface ITirBinaryExpr extends ITirExpr
{
    left: TirExpr;
    right: TirExpr;
}

export class TirExponentiationExpr
    implements ITirBinaryExpr
{
    readonly type: TirType = int_t;
    constructor(
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
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
        public left: TirExpr,
        public right: TirExpr,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        const deps = this.left.deps();
        mergeSortedStrArrInplace( deps, this.right.deps() );
        return deps;
    }
}