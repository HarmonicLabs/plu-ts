import { CaseExpr, CaseExprMatcher } from "../../../../ast/nodes/expr/CaseExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirCaseExpr, TirCaseExprMatcher } from "../../../tir/expressions/TirCaseExpr";
import { TirType } from "../../../tir/types/TirType";
import { canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileVarDecl } from "../statements/_compileVarStmt";
import { _compileExpr } from "./_compileExpr";

export function _compileCaseExpr(
    ctx: AstCompilationCtx,
    expr: CaseExpr,
    typeHint: TirType | undefined
): TirCaseExpr | undefined
{
    const matchExpr = _compileExpr( ctx, expr.matchExpr, typeHint );
    if( !matchExpr ) return undefined;

    const cases = expr.cases.map( branch =>
        _compileCaseExprMatcher(
            ctx,
            branch,
            matchExpr.type,
            typeHint
        )
    ) as TirCaseExprMatcher[]; // we early return in case of undefined so this is safe
    if( cases.some( c => !c ) ) return undefined;

    const returnType = cases[0]?.body.type ?? typeHint;
    if( !returnType ) return ctx.error(
        DiagnosticCode.Cannot_infer_return_type_Try_to_make_the_type_explicit,
        expr.range
    );

    return new TirCaseExpr(
        matchExpr,
        cases,
        returnType,
        expr.range
    );
}

export function _compileCaseExprMatcher(
    ctx: AstCompilationCtx,
    matcher: CaseExprMatcher,
    patternType: TirType,
    returnTypeHint: TirType | undefined
): TirCaseExprMatcher | undefined
{
    const pattern = _compileVarDecl( ctx, matcher.pattern, patternType );
    if( !pattern ) return undefined;
    if( !canAssignTo( pattern.type, patternType ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        matcher.pattern.range, pattern.type.toString(), patternType.toString()
    );

    const body = _compileExpr( ctx, matcher.body, returnTypeHint );
    if( !body ) return undefined;
    if( returnTypeHint && !canAssignTo( body.type, returnTypeHint ) ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        matcher.body.range, body.type.toString(), returnTypeHint.toString()
    );

    return new TirCaseExprMatcher(
        pattern,
        body,
        matcher.range
    );
}