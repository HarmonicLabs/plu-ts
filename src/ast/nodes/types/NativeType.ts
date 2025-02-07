import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { VarDecl } from "../statements/declarations/VarDecl/VarDecl";
import { PebbleAstType } from "./PebbleAstType";

export type AstNativeType
    = AstVoidType
    | AstBooleanType
    | AstNumberType
    | AstBytesType
    | AstNativeOptionalType<PebbleAstType>
    | AstListType<PebbleAstType>
    | AstLinearMapType<PebbleAstType,PebbleAstType>
    | AstFuncType
    ;

export function isAstNativeType( thing: any ): thing is AstNativeType
{
    return (
        thing instanceof AstVoidType
        || thing instanceof AstBooleanType
        || thing instanceof AstNumberType
        || thing instanceof AstBytesType
        || thing instanceof AstNativeOptionalType
        || thing instanceof AstListType
        || thing instanceof AstLinearMapType
        || thing instanceof AstFuncType
    );
}

export class AstVoidType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class AstBooleanType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class AstNumberType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class AstBytesType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}
}

export class AstNativeOptionalType<TArg extends PebbleAstType> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}
}

export class AstListType<TArg extends PebbleAstType> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}
}

export class AstLinearMapType<KT extends PebbleAstType, VT extends PebbleAstType> implements HasSourceRange
{
    constructor(
        readonly keyTypeArg: KT,
        readonly valTypeArg: VT,
        readonly range: SourceRange
    ) {}
}

export class AstFuncType implements HasSourceRange
{
    constructor(
        readonly params: VarDecl[],
        readonly returnType: PebbleAstType | undefined,
        readonly range: SourceRange
    ) {}
}