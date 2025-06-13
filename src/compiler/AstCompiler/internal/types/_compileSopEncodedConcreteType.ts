import { AstNamedTypeExpr } from "../../../../ast/nodes/types/AstNamedTypeExpr";
import { AstVoidType, AstBooleanType, AstIntType, AstBytesType, AstNativeOptionalType, AstListType, AstLinearMapType, AstFuncType } from "../../../../ast/nodes/types/AstNativeTypeExpr";
import { AstTypeExpr } from "../../../../ast/nodes/types/AstTypeExpr";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirListT, TirLinearMapT, TirSopOptT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileDataEncodedConcreteType } from "./_compileDataEncodedConcreteType";


export function _compileSopEncodedConcreteType(
    ctx: AstCompilationCtx,
    typeExpr: AstTypeExpr
): TirType | undefined
{
    if( typeExpr instanceof AstVoidType ) return ctx.program.stdTypes.void;
    if( typeExpr instanceof AstBooleanType ) return ctx.program.stdTypes.bool;
    if( typeExpr instanceof AstIntType ) return ctx.program.stdTypes.int;
    if( typeExpr instanceof AstBytesType ) return ctx.program.stdTypes.bytes;
    if( typeExpr instanceof AstNativeOptionalType )
    {
        const compiledArg = _compileSopEncodedConcreteType( ctx, typeExpr.typeArg );
        if(!(
            compiledArg
            && compiledArg.isConcrete()
        )) return undefined;

        return ctx.program.getAppliedGeneric(
            TirSopOptT.toTirTypeKey(),
            [ compiledArg ]
        );
    }
    if( typeExpr instanceof AstListType )
    {
        // native list only supports low leve uplc types (no constrs, no functions etc.)
        const compiledArg = _compileDataEncodedConcreteType( ctx, typeExpr.typeArg );
        if(!(
            compiledArg
            && compiledArg.isConcrete()
        )) return undefined;
        
        return ctx.program.getAppliedGeneric(
            TirListT.toTirTypeKey(),
            [ compiledArg ]
        );
    }
    if( typeExpr instanceof AstLinearMapType )
    {
        // native linearMap only supports low leve uplc types (no constrs, no functions etc.)
        const kArg = _compileDataEncodedConcreteType( ctx, typeExpr.keyTypeArg );
        const vArg = _compileDataEncodedConcreteType( ctx, typeExpr.valTypeArg );
        if(!(
            kArg
            && vArg
            && kArg.isConcrete()
            && vArg.isConcrete()
        )) return undefined;

        return ctx.program.getAppliedGeneric(
            TirLinearMapT.toTirTypeKey(),
            [ kArg, vArg ]
        );
    }
    if( typeExpr instanceof AstFuncType ) return undefined; // no data encoding for function types
    if( typeExpr instanceof AstNamedTypeExpr ) // struct, aliases and respective params
    {
        const possibleTirNames = ctx.scope.resolveType( typeExpr.name.text );
        if( !possibleTirNames ) return ctx.error(
            DiagnosticCode._0_is_not_defined,
            typeExpr.name.range, typeExpr.name.text
        );

        if( possibleTirNames.isGeneric ) throw new Error("not implemented: _compileSopEncodedConcreteType for generic types");

        if( typeof possibleTirNames.dataTirName !== "string" ) return undefined;

        return ctx.program.types.get( possibleTirNames.dataTirName );
    }

    const tsEnsureExsautstiveCheck: never = typeExpr;
    console.error( typeExpr );
    throw new Error("unreachable::AstCompiler::_compileSopEncodedConcreteType");
}