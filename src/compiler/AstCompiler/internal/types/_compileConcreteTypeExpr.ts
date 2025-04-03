import { AstNamedTypeExpr } from "../../../../ast/nodes/types/AstNamedTypeExpr";
import { AstVoidType, AstBooleanType, AstIntType, AstBytesType, AstNativeOptionalType, AstListType, AstLinearMapType, AstFuncType } from "../../../../ast/nodes/types/AstNativeTypeExpr";
import { AstTypeExpr } from "../../../../ast/nodes/types/AstTypeExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirOptT, TirListT, TirLinearMapT, TirFuncT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { getAppliedTypeInternalName } from "../../scope/Scope";
import { void_t, bool_t, int_t, bytes_t } from "../../scope/stdScope/stdScope";
import { PebbleConcreteTypeSym, PebbleGenericSym } from "../../scope/symbols/PebbleSym";

export function _compileConcreteTypeExpr(
    ctx: AstCompilationCtx,
    typeExpr: AstTypeExpr
): TirType | undefined
{
    if( typeExpr instanceof AstVoidType ) return void_t;
    if( typeExpr instanceof AstBooleanType ) return bool_t;
    if( typeExpr instanceof AstIntType ) return int_t;
    if( typeExpr instanceof AstBytesType ) return bytes_t;
    if( typeExpr instanceof AstNativeOptionalType )
    {
        const compiledArg = _compileConcreteTypeExpr( ctx, typeExpr.typeArg );
        if( !compiledArg || !compiledArg.isConcrete() ) return undefined;

        const compiledInternalName = compiledArg.toInternalName();
        let sym = ctx.scope.getAppliedGenericType(
            "Optional",
            [  compiledInternalName ]
        );
        if( !sym )
        {
            const inferredType = new TirOptT( compiledArg );
            if( !inferredType.isConcrete() ) return undefined; // unreachable; just setting _isConcrete to true

            sym = new PebbleConcreteTypeSym({
                name: getAppliedTypeInternalName(
                    "Optional",
                    [ compiledInternalName ]
                ),
                concreteType: inferredType
            });
            ctx.scope.defineConcreteType( sym );
        }
        return sym.concreteType; // use exsisting type
    }
    if( typeExpr instanceof AstListType )
    {
        const compiledArg = _compileConcreteTypeExpr( ctx, typeExpr.typeArg );
        if( !compiledArg || !compiledArg.isConcrete() ) return undefined;
        
        const compiledInternalName = compiledArg.toInternalName();
        let sym = ctx.scope.getAppliedGenericType(
            "List",
            [  compiledInternalName ]
        );

        if( !sym )
        {
            const inferredType = new TirListT( compiledArg );
            if( !inferredType.isConcrete() ) return undefined; // unreachable; just setting _isConcrete to true
            sym = new PebbleConcreteTypeSym({
                name: getAppliedTypeInternalName(
                    "List",
                    [ compiledInternalName ]
                ),
                concreteType: inferredType
            });
            ctx.scope.defineConcreteType( sym );
        }

        return sym.concreteType; // use exsisting type
    }
    if( typeExpr instanceof AstLinearMapType )
    {
        const kArg = _compileConcreteTypeExpr( ctx, typeExpr.keyTypeArg );
        if( !kArg || !kArg.isConcrete() ) return undefined;

        const vArg = _compileConcreteTypeExpr( ctx, typeExpr.valTypeArg );
        if( !vArg || !vArg.isConcrete() ) return undefined;

        const kInternalName = kArg.toInternalName();
        const vInternalName = vArg.toInternalName();
        let sym = ctx.scope.getAppliedGenericType(
            "LinearMap",
            [ kInternalName, vInternalName ]
        );

        if( !sym )
        {
            const inferredType = new TirLinearMapT( kArg, vArg );
            if( !inferredType.isConcrete() ) return undefined; // unreachable; just setting _isConcrete to true
            sym = new PebbleConcreteTypeSym({
                name: getAppliedTypeInternalName(
                    "LinearMap",
                    [ kInternalName, vInternalName ]
                ),
                concreteType: inferredType
            });
            ctx.scope.defineConcreteType( sym );
        }

        return sym.concreteType; // use exsisting type
    }
    if( typeExpr instanceof AstFuncType )
    {
        if( !typeExpr.returnType ) return ctx.error(
            DiagnosticCode.Type_expected,
            typeExpr.range.atEnd()
        );

        const argTypes = typeExpr.params.map( argTypeExpr =>
            _compileConcreteTypeExpr( ctx, argTypeExpr )
        );
        if( argTypes.some( argType => !argType || !argType.isConcrete() ) ) return undefined;

        const retType = _compileConcreteTypeExpr( ctx, typeExpr.returnType );
        if( !retType || !retType.isConcrete() ) return undefined;

        // there is no need to generate symbols on (anonymous) function types
        return new TirFuncT( argTypes as TirType[], retType );
    }
    if( typeExpr instanceof AstNamedTypeExpr ) // struct, aliases and respective params
    {
        const typeDefSym = ctx.scope.resolveType( typeExpr.name.text );
        if( !typeDefSym ) return ctx.error(
            DiagnosticCode._0_is_not_defined,
            typeExpr.name.range, typeExpr.name.text
        );

        const typeExprArgs = typeExpr.tyArgs.map( typeArgExpr =>
            _compileConcreteTypeExpr( ctx, typeArgExpr )
        ) as TirType[];
        if( typeExprArgs.some( typeArg =>
            !typeArg
            || !typeArg.isConcrete()
        )) return undefined;

        if( typeDefSym instanceof PebbleConcreteTypeSym )
        {
            if( typeExprArgs.length > 0 )
            return ctx.error(
                DiagnosticCode.Type_0_is_not_generic,
                typeExpr.name.range, typeDefSym.concreteType.toString()
            );
            return typeDefSym.concreteType;
        }
        if( typeDefSym instanceof PebbleGenericSym )
        {
            const nTypeDefArgs = typeDefSym.nTypeParameters
            if( typeExprArgs.length !== nTypeDefArgs )
            return ctx.error(
                DiagnosticCode.Expected_0_type_arguments_but_got_1,
                typeExpr.range, nTypeDefArgs.toString(), typeExprArgs.length.toString()
            );
            const inferredType = typeDefSym.getConcreteType( ...typeExprArgs );
            if( !inferredType ) return ctx.error(
                DiagnosticCode.Cannot_evaluate_type_expression,
                typeExpr.range
            );
            return inferredType;
        }
        
        console.error( typeDefSym );
        throw new Error("unreachable::AstCompiler::_compileConcreteTypeExpr");
    }

    console.error( typeExpr );
    throw new Error("unreachable::AstCompiler::_compileConcreteTypeExpr");
}