import { CallExpr } from "../../../../ast/nodes/expr/functions/CallExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirCallExpr } from "../../../tir/expressions/TirCallExpr";
import { TirExpr } from "../../../tir/expressions/TirExpr";
import { TirFuncT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileExpr } from "./_compileExpr";

export function _compileCallExpr(
    ctx: AstCompilationCtx,
    expr: CallExpr,
    typeHint: TirType | undefined
): TirCallExpr | undefined
{
    // TODO: expr.genericTypeArgs
    expr.funcExpr;
    expr.args;
    expr.range;

    if(!( typeHint instanceof TirFuncT )) typeHint = undefined;

    const funcExpr = _compileExpr( ctx, expr.funcExpr, typeHint );
    if( !funcExpr ) return undefined;

    if( !( funcExpr.type instanceof TirFuncT ) ) return ctx.error(
        DiagnosticCode.Expression_is_not_callable,
        expr.funcExpr.range
    );
    const funcType = funcExpr.type;

    for( let i = funcType.argTypes.length; i < expr.args.length; i++ )
    {
        ctx.warning(
            DiagnosticCode.Unexpected_argument,
            expr.args[i].range
        ); // not a big deal
    }

    if( funcType.argTypes.length < expr.args.length )
        expr.args.length = funcType.argTypes.length; // drop extra

    const finalCallExprType = funcType.argTypes.length === expr.args.length ?
        funcType.returnType :
        new TirFuncT( funcType.argTypes.slice( expr.args.length ), funcType.returnType );

    const args = expr.args.map((arg, i) =>
        _compileExpr( ctx, arg, funcType.argTypes[i] )
    ) as TirExpr[]; // we early return in case of undefined
    for( let i = 0; i < args.length; i++ )
    {
        const arg = args[i];
        if( !arg ) return undefined;
        if( !canAssignTo( arg.type, funcType.argTypes[i] ) )
        return ctx.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.args[i].range, arg.type.toString(), funcType.argTypes[i].toString()
        );
    }

    return new TirCallExpr(
        funcExpr,
        args,
        finalCallExprType,
        expr.range
    );
}