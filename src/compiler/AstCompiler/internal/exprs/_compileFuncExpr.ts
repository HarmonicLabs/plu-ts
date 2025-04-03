import { FuncExpr } from "../../../../ast/nodes/expr/functions/FuncExpr";
import { BlockStmt } from "../../../../ast/nodes/statements/BlockStmt";
import { ReturnStmt } from "../../../../ast/nodes/statements/ReturnStmt";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { getInternalVarName } from "../../../internalVar";
import { TirFuncExpr } from "../../../tir/expressions/TirFuncExpr";
import { TirVariableAccessExpr } from "../../../tir/expressions/TirVariableAccessExpr";
import { TirStmt } from "../../../tir/statements/TirStmt";
import { TirSimpleVarDecl } from "../../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirFuncT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { TirTypeParam } from "../../../tir/types/TirTypeParam";
import { getUnaliased } from "../../../tir/types/type-check-utils/getUnaliased";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { PebbleValueSym } from "../../scope/symbols/PebbleSym";
import { _compileBlockStmt } from "../statements/_compileBlockStmt";
import { _compileVarDecl } from "../statements/_compileVarStmt";
import { _compileConcreteTypeExpr } from "../types/_compileConcreteTypeExpr";
import { _hasDuplicateTypeParams } from "./_hasDuplicateTypeParams";

export function _compileFuncExpr(
    ctx: AstCompilationCtx,
    expr: FuncExpr,
    typeHint: TirType | undefined
): TirFuncExpr | undefined
{
    if( typeHint )
    {
        typeHint = getUnaliased( typeHint );
        if(!( typeHint instanceof TirFuncT ))
            // if the result type is not good for the calling context
            // it should be checked there,
            // typeHint is just a hint
            typeHint = undefined;
    }

    const funcName = expr.name.text;

    const funcCtx = ctx.newFunctionChildScope( funcName );

    if( _hasDuplicateTypeParams( ctx, expr.typeParams ) ) return undefined;

    const typeParams = expr.typeParams.map( tp =>
        new TirTypeParam( tp.text )
    );
    const typeParamsMap = new Map<string, TirTypeParam>(
        typeParams.map( tp => [ tp.name, tp ] )
    );
    
    const blockInitStmts: TirStmt[] = [];
    const params: TirSimpleVarDecl[] = [];
    for( const astParam of expr.signature.params )
    {
        const tirParam = _compileVarDecl(
            funcCtx,
            astParam,
            undefined
        );
        if( !tirParam ) return undefined;

        if( tirParam instanceof TirSimpleVarDecl )
        {
            params.push( tirParam );
            continue;
        }
        // else move destructuring in the body

        const uniqueName = getInternalVarName(
            tirParam.type.toString().toLocaleLowerCase()
        );

        const simpleParam = new TirSimpleVarDecl(
            uniqueName,
            tirParam.type,
            tirParam.initExpr,
            tirParam.range
        );
        tirParam.initExpr = new TirVariableAccessExpr(
            simpleParam.name,
            simpleParam.type,
            tirParam.range
        );

        params.push( simpleParam );
        blockInitStmts.push( tirParam );
    }

    const functionCtx = funcCtx.functionCtx;
    if( !functionCtx ) throw new Error("functionCtx is undefined");

    const signatureReturnType = expr.signature.returnType ? _compileConcreteTypeExpr(
        ctx,
        expr.signature.returnType
    ) : undefined;

    functionCtx.returnHints.type = signatureReturnType ?? typeHint?.returnType;

    if( !expr.name.isAnonymous() )
    {
        // define (temporarly) the function in the scope
        // for recursion
        const fullType = new TirFuncT(
            params.map( p => p.type ),
            signatureReturnType ?? typeHint?.returnType ?? new TirTypeParam("any")
        );
        funcCtx.scope.valueSymbols.symbols.set( funcName, new PebbleValueSym({
            name: funcName,
            type: fullType,
            isConstant: true
        }));
    }

    const astBody = expr.body instanceof BlockStmt ? expr.body :
        new BlockStmt( [
            new ReturnStmt( expr.body, expr.body.range )
        ], expr.body.range );

    const compileResult = _compileBlockStmt(
        funcCtx,
        astBody
    );
    if( !compileResult ) return undefined;
    const body = compileResult[0];

    body.stmts.unshift( ...blockInitStmts );

    const returnType = functionCtx.returnHints.type;
    if( !returnType ) return ctx.error(
        DiagnosticCode.Cannot_infer_return_type_Try_to_make_the_type_explicit,
        expr.name.range
    );

    return new TirFuncExpr(
        expr.name.text,
        typeParams,
        params,
        returnType,
        body,
        expr.range
    );
}