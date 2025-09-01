import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { VarDecl } from "../statements/declarations/VarDecl/VarDecl";
import { AstTypeExpr } from "./AstTypeExpr";
// causes circular dependency
// import { TirVoidT, TirBoolT, TirIntT, TirBytesT } from "../../../compiler/tir/types/TirNativeType";

export type AstNativeTypeExpr
    = AstVoidType
    | AstBooleanType
    | AstIntType
    | AstBytesType

    | AstNativeOptionalType<AstTypeExpr>
    | AstListType<AstTypeExpr>
    | AstLinearMapType<AstTypeExpr,AstTypeExpr>
    | AstFuncType

    ;

export function isAstNativeTypeExpr( thing: any ): thing is AstNativeTypeExpr
{
    return (
        thing instanceof AstVoidType
        || thing instanceof AstBooleanType
        || thing instanceof AstIntType
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

    // toAstName() { return TirVoidT.toTirTypeKey(); }
    toAstName() { return "void"; }
}

export class AstBooleanType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}

    // toAstName() { return TirBoolT.toTirTypeKey(); }
    toAstName() { return "boolean"; }
}

export class AstIntType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}

    // toAstName() { return TirIntT.toTirTypeKey(); }
    toAstName() { return "int"; }
}

export class AstBytesType implements HasSourceRange
{
    constructor(
        readonly range: SourceRange
    ) {}

    // toAstName() { return TirBytesT.toTirTypeKey(); }
    toAstName() { return "bytes"; }
}

export class AstNativeOptionalType<TArg extends AstTypeExpr> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}

    toAstName() { return "Optional"; }
}

export class AstListType<TArg extends AstTypeExpr> implements HasSourceRange
{
    constructor(
        readonly typeArg: TArg,
        readonly range: SourceRange
    ) {}

    toAstName() { return "List"; }
}

export class AstLinearMapType<KT extends AstTypeExpr, VT extends AstTypeExpr> implements HasSourceRange
{
    constructor(
        readonly keyTypeArg: KT,
        readonly valTypeArg: VT,
        readonly range: SourceRange
    ) {}

    toAstName() { return "LinearMap"; }
}

export class AstFuncType implements HasSourceRange
{
    constructor(
        readonly params: VarDecl[],
        readonly returnType: AstTypeExpr | undefined,
        readonly range: SourceRange
    ) {}

    toAstName() { return "Function"; }
}