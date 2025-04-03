import { PropAccessExpr, OptionalPropAccessExpr, NonNullPropAccessExpr, DotPropAccessExpr } from "../../../../ast/nodes/expr/PropAccessExpr";
import { NonNullExpr } from "../../../../ast/nodes/expr/unary/NonNullExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirPropAccessExpr, TirOptionalPropAccessExpr, TirDotPropAccessExpr } from "../../../tir/expressions/TirPropAccessExpr";
import { TirOptT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { getPropAccessReturnType } from "../../utils/getPropAccessReturnType";
import { _compileExpr } from "./_compileExpr";
import { _compileNonNullExpr } from "./_compileNonNullExpr";

export function _compilePropAccessExpr(
    ctx: AstCompilationCtx,
    expr: PropAccessExpr,
    typeHint: TirType | undefined
): TirPropAccessExpr | undefined
{
    if( expr instanceof OptionalPropAccessExpr ) return _compileOptionalPropAccessExpr( ctx, expr, typeHint );
    if( expr instanceof NonNullPropAccessExpr ) return _compileNonNullPropAccessExpr( ctx, expr, typeHint );
    if( expr instanceof DotPropAccessExpr ) return _compileDotPropAccessExpr( ctx, expr, typeHint );

    console.error( expr );
    throw new Error("unreachable::AstCompiler::_compilePropAccessExpr");
}

export function _compileOptionalPropAccessExpr(
    ctx: AstCompilationCtx,
    expr: OptionalPropAccessExpr,
    _typeHint: TirType | undefined
): TirOptionalPropAccessExpr | undefined
{
    const objExpr = _compileExpr( ctx, expr.object, undefined );
    if( !objExpr ) return undefined;

    const objType = objExpr.type;
    const returnType = getPropAccessReturnType( objType, expr.prop );
    if( !returnType ) return ctx.error(
        DiagnosticCode.Property_0_does_not_exist_on_type_1,
        expr.prop.range, expr.prop.text, objType.toString()
    );

    const optionalType = new TirOptT( returnType );

    return new TirOptionalPropAccessExpr(
        objExpr,
        expr.prop,
        optionalType,
        expr.range
    );
}

export function _compileNonNullPropAccessExpr(
    ctx: AstCompilationCtx,
    expr: NonNullPropAccessExpr,
    _typeHint: TirType | undefined
): TirDotPropAccessExpr | undefined
{
    const nonNullObj = _compileNonNullExpr(
        ctx,
        new NonNullExpr( expr.object, expr.object.range ),
        undefined
    );
    if( !nonNullObj ) return undefined;
    return _compileDotPropAccessExpr(
        ctx,
        new DotPropAccessExpr( nonNullObj, expr.prop, expr.range ),
        _typeHint
    );
}

export function _compileDotPropAccessExpr(
    ctx: AstCompilationCtx,
    expr: DotPropAccessExpr,
    _typeHint: TirType | undefined
): TirDotPropAccessExpr | undefined
{
    const objExpr = _compileExpr( ctx, expr.object, undefined );
    if( !objExpr ) return undefined;

    const objType = objExpr.type;
    const returnType = getPropAccessReturnType( objType, expr.prop );
    if( !returnType ) return ctx.error(
        DiagnosticCode.Property_0_does_not_exist_on_type_1,
        expr.prop.range, expr.prop.text, objType.toString()
    );

    return new TirDotPropAccessExpr(
        objExpr,
        expr.prop,
        returnType,
        expr.range
    );
}