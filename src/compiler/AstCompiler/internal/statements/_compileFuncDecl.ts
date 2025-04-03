import { FuncDecl } from "../../../../ast/nodes/statements/declarations/FuncDecl";
import { TirFuncDecl } from "../../../tir/statements/TirFuncDecl";
import { TirFuncT } from "../../../tir/types/TirNativeType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { PebbleValueSym } from "../../scope/symbols/PebbleSym";
import { _compileFuncExpr } from "../exprs/_compileFuncExpr";

export function _compileFuncDecl(
    ctx: AstCompilationCtx,
    stmt: FuncDecl
): [ TirFuncDecl ] | undefined
{
    const expr = _compileFuncExpr(
        ctx,
        stmt.expr,
        undefined
    );
    if( !expr ) return undefined;

    expr.typeParams;

    const fullType = new TirFuncT(
        expr.params.map( p => p.type ),
        expr.returnType
    );

    ctx.scope.defineValue(new PebbleValueSym({
        name: expr.name,
        type: fullType,
        isConstant: true
    }));

    return [ new TirFuncDecl( expr ) ];
}