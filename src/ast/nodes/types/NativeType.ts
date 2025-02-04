import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { VarDecl } from "../statements/declarations/VarDecl/VarDecl";
import { PebbleType } from "./PebbleType";

export type NativeType
    = VoidType
    | BooleanType
    | NumberType
    | BytesType
    | NativeOptionalType<PebbleType>
    | ListType<PebbleType>
    | LinearMapType<PebbleType,PebbleType>
    | FuncType
    ;

export function isNativeType( thing: any ): thing is NativeType
{
    return (
        thing instanceof VoidType
        || thing instanceof BooleanType
        || thing instanceof NumberType
        || thing instanceof BytesType
        || thing instanceof NativeOptionalType
        || thing instanceof ListType
        || thing instanceof LinearMapType
        || thing instanceof FuncType
    );
}

export class VoidType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class BooleanType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class NumberType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class BytesType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class NativeOptionalType<TArg extends PebbleType> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}
}

export class ListType<TArg extends PebbleType> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}
}

export class LinearMapType<KT extends PebbleType, VT extends PebbleType> implements HasSourceRange
{
    constructor(
        readonly keyTypeArg: KT,
        readonly valTypeArg: VT,
        readonly range: SourceRange
    ) {}
}

export class FuncType implements HasSourceRange
{
    constructor(
        readonly params: VarDecl[],
        readonly returnType: PebbleType | undefined,
        readonly range: SourceRange
    ) {}
}