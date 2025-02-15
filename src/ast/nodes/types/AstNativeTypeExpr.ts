import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { VarDecl } from "../statements/declarations/VarDecl/VarDecl";
import { AstNamedTypeExpr } from "./AstNamedTypeExpr";
import { AstTypeExpr } from "./AstTypeExpr";

export type AstNativeTypeExpr
    = AstVoidType
    | AstBooleanType
    | AstNumberType
    | AstBytesType

    | AstNativeOptionalType<AstTypeExpr>
    | AstListType<AstTypeExpr>
    | AstLinearMapType<AstTypeExpr,AstTypeExpr>
    | AstFuncType
    | AstAsSopType
    | AstAsDataType

    ;

export function isAstNativeTypeExpr( thing: any ): thing is AstNativeTypeExpr
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
        || thing instanceof AstAsSopType
        || thing instanceof AstAsDataType
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

export class AstNativeOptionalType<TArg extends AstTypeExpr> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}
}

export class AstListType<TArg extends AstTypeExpr> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}
}

export class AstLinearMapType<KT extends AstTypeExpr, VT extends AstTypeExpr> implements HasSourceRange
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
        readonly returnType: AstTypeExpr | undefined,
        readonly range: SourceRange
    ) {}
}

export class AstAsSopType implements HasSourceRange
{
    constructor(
        /* AsSop only takes structs or aliases of structs */
        readonly tyParams: AstNamedTypeExpr,
        readonly range: SourceRange
    ) {}
}

export class AstAsDataType implements HasSourceRange
{
    constructor(
        /* AsData only takes structs or aliases of structs */
        readonly tyParams: AstNamedTypeExpr,
        readonly range: SourceRange
    ) {}
}