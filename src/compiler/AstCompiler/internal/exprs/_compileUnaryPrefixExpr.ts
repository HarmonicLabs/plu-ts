import { UnaryExclamation } from "../../../../ast/nodes/expr/unary/UnaryExclamation";
import { UnaryMinus } from "../../../../ast/nodes/expr/unary/UnaryMinus";
import { UnaryPlus } from "../../../../ast/nodes/expr/unary/UnaryPlus";
import { UnaryPrefixExpr } from "../../../../ast/nodes/expr/unary/UnaryPrefixExpr";
import { UnaryTilde } from "../../../../ast/nodes/expr/unary/UnaryTilde";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirUnaryExclamation } from "../../../tir/expressions/unary/TirUnaryExclamation";
import { TirUnaryMinus } from "../../../tir/expressions/unary/TirUnaryMinus";
import { TirUnaryPlus } from "../../../tir/expressions/unary/TirUnaryPlus";
import { TirUnaryPrefixExpr } from "../../../tir/expressions/unary/TirUnaryPrefixExpr";
import { TirUnaryTilde } from "../../../tir/expressions/unary/TirUnaryTilde";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { bool_t, any_optional_t, int_t, bytes_t } from "../../scope/stdScope/stdScope";
import { _compileExpr } from "./_compileExpr";

export function _compileUnaryPrefixExpr(
    ctx: AstCompilationCtx,
    expr: UnaryPrefixExpr,
    _typeHint: TirType | undefined
): TirUnaryPrefixExpr | undefined
{
    if( expr instanceof UnaryExclamation )
    {
        const operand = _compileExpr( ctx, expr.operand, bool_t );
        if( !operand ) return undefined;
        const operandType = operand.type;
        if(!(
            canAssignTo( operandType, bool_t )
            || canAssignTo( operandType, any_optional_t )
        )) {
            return ctx.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                expr.operand.range, operand.type.toString(), "boolean | Optional<T>"
            );
        }
        return new TirUnaryExclamation(
            operand,
            bool_t,
            expr.range
        );
    }
    else if(
        expr instanceof UnaryPlus
        || expr instanceof UnaryMinus
    )
    {
        const operand = _compileExpr( ctx, expr.operand, int_t );
        if( !operand ) return undefined;
        const operandType = operand.type;
        if( !canAssignTo( operandType, int_t ) ) {
            return ctx.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                expr.operand.range, operand.type.toString(), "int"
            );
        }
        if( expr instanceof UnaryPlus ) return new TirUnaryPlus( operand, int_t, expr.range );
        if( expr instanceof UnaryMinus ) return new TirUnaryMinus( operand, int_t, expr.range );
    }
    else if( expr instanceof UnaryTilde )
    {
        const operand = _compileExpr( ctx, expr.operand, bytes_t );
        if( !operand ) return undefined;
        const operandType = operand.type;
        if( !canAssignTo( operandType, bytes_t ) ) {
            return ctx.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                expr.operand.range, operand.type.toString(), "bytes"
            );
        }
        return new TirUnaryTilde( operand, int_t, expr.range );
    }

    console.error( expr );
    throw new Error("unreachable::AstCompiler::_compileUnaryPrefixExpr");
}