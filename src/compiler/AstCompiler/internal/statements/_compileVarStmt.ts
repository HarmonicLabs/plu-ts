import { PebbleExpr } from "../../../../ast/nodes/expr/PebbleExpr";
import { ArrayLikeDeconstr } from "../../../../ast/nodes/statements/declarations/VarDecl/ArrayLikeDeconstr";
import { NamedDeconstructVarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/NamedDeconstructVarDecl";
import { SimpleVarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { SingleDeconstructVarDecl, ISingleDeconstructVarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/SingleDeconstructVarDecl";
import { VarDecl } from "../../../../ast/nodes/statements/declarations/VarDecl/VarDecl";
import { VarStmt } from "../../../../ast/nodes/statements/VarStmt";
import { AstTypeExpr } from "../../../../ast/nodes/types/AstTypeExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { DiagnosticCode } from "../../../../diagnostics/diagnosticMessages.generated";
import { TirExpr } from "../../../tir/expressions/TirExpr";
import { TirArrayLikeDeconstr } from "../../../tir/statements/TirVarDecl/TirArrayLikeDeconstr";
import { TirNamedDeconstructVarDecl } from "../../../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSimpleVarDecl } from "../../../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirSingleDeconstructVarDecl } from "../../../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirVarDecl } from "../../../tir/statements/TirVarDecl/TirVarDecl";
import { TirOptT, TirDataT } from "../../../tir/types/TirNativeType";
import { TirStructType, TirStructConstr, TirStructField } from "../../../tir/types/TirStructType";
import { TirType } from "../../../tir/types/TirType";
import { getNamedDestructableType, getStructType, canAssignTo } from "../../../tir/types/type-check-utils/canAssignTo";
import { canCastToData } from "../../../tir/types/type-check-utils/canCastTo";
import { getListTypeArg } from "../../../tir/types/type-check-utils/getListTypeArg";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileExpr } from "../exprs/_compileExpr";
import { _compileConcreteTypeExpr } from "../types/_compileConcreteTypeExpr";

export function _compileVarStmt(
    ctx: AstCompilationCtx,
    stmt: VarStmt,
    isTopLevel: boolean
): TirVarDecl[] | undefined
{
    const tirVarDecls: TirVarDecl[] = [];
    for( const decl of stmt.declarations )
    {
        const tirDecl = _compileVarDecl( ctx, decl, undefined, isTopLevel );
        if( !tirDecl ) return undefined;
        tirVarDecls.push( tirDecl );
    }
    return tirVarDecls;
}
export function _compileVarDecl(
    ctx: AstCompilationCtx,
    decl: VarDecl,
    typeHint: TirType | undefined, // coming from deconstructing
    isTopLevel: boolean = false
    // useful to infer variable type by usage
    // sameLevelStmts: readonly PebbleStmt[],
    // stmtIdx: number
): TirVarDecl | undefined
{
    if(
        isTopLevel &&
        !decl.isConst()
    ) return ctx.error(
        DiagnosticCode.Only_constants_can_be_declared_outside_of_a_function,
        decl.range
    );
    if( decl instanceof SimpleVarDecl )
        return _compileSimpleVarDecl( ctx, decl, typeHint );
    if( decl instanceof NamedDeconstructVarDecl )
        return _compileNamedDeconstructVarDecl( ctx, decl, typeHint );
    if( decl instanceof SingleDeconstructVarDecl )
        return _compileSingleDeconstructVarDecl( ctx, decl, typeHint );
    if( decl instanceof ArrayLikeDeconstr )
        return _compileArrayLikeDeconstr( ctx, decl, typeHint );

    console.error( decl );
    throw new Error("unreachable::AstCompiler::_compileVarDecl");
}
export function _compileSimpleVarDecl(
    ctx: AstCompilationCtx,
    decl: SimpleVarDecl,
    typeHint: TirType | undefined, // coming from deconstructing
    // useful to infer variable type by usage
    // sameLevelStmts: readonly PebbleStmt[],
    // stmtIdx: number
): TirVarDecl | undefined
{
    const typeAndExpr = _getVarDeclTypeAndExpr( ctx, decl, typeHint );
    if( !typeAndExpr ) return undefined;
    const [ finalVarType, initExpr ] = typeAndExpr;

    const success = ctx.scope.defineValue({
        name: decl.name.text,
        type: finalVarType,
        isConstant: decl.isConst()
    });
    if( !success )
    return ctx.error(
        DiagnosticCode.Duplicate_identifier_0,
        decl.name.range, decl.name.text
    );

    return new TirSimpleVarDecl(
        decl.name.text,
        finalVarType,
        initExpr,
        decl.range
    );
}
export function _compileNamedDeconstructVarDecl(
    ctx: AstCompilationCtx,
    decl: NamedDeconstructVarDecl,
    typeHint: TirType | undefined, // coming from deconstructing
    // useful to infer variable type by usage
    // sameLevelStmts: readonly PebbleStmt[],
    // stmtIdx: number
): TirNamedDeconstructVarDecl | undefined
{
    // const Spending{ ref, optionalDatum: datum as MyDatum } = purpose
    // 
    // if encoded as data becomes:
    //
    // const §rawPurposePair: §NativePair<int,List<data>> = purpose.raw;
    // assert §rawPurposePair.fst === /* speding constructor index */;
    // const §rawPurposeFields: List<data> = §rawPurposePair.snd;
    // const ref: TxOutRef = §rawPurposeFields[/* `ref` field index */];
    // const datum: MyDatum = §rawPurposeFields[/* `optionalDatum` field index */];
    // 
    // if encoded as SoP becomes:
    // 
    // SHIT I JUST REALISED THIS NEEDS TO BE OPTIMIZED AT LOWER LEVEL

    const typeAndExpr = _getVarDeclTypeAndExpr( ctx, decl, typeHint );
    if( !typeAndExpr ) return undefined;
    const [ finalVarType, initExpr ] = typeAndExpr;

    const namedDestructableType = getNamedDestructableType( finalVarType )
    if(
        !namedDestructableType
        || !namedDestructableType.isConcrete()
    )
    return ctx.error(
        DiagnosticCode.Invaild_destructuring,
        decl.range
    );

    if( namedDestructableType instanceof TirStructType )
    {
        const finalConstructorDef = namedDestructableType.constructors.find( ctor =>
            ctor.name === decl.name.text
        );
        if( !finalConstructorDef )
        return ctx.error(
            DiagnosticCode.Construcotr_0_is_not_part_of_the_definiton_of_1,
            decl.name.range, decl.name.text, namedDestructableType.toString()
        );

        const deconstructedFields = _getDeconstructedFields(
            ctx,
            decl,
            finalConstructorDef
        );
        if( !deconstructedFields ) return undefined;
        const [ fieds, rest ] = deconstructedFields;

        return new TirNamedDeconstructVarDecl(
            decl.name.text,
            fieds,
            rest,
            finalVarType,
            initExpr,
            decl.flags,
            decl.range
        );
    }
    if( namedDestructableType instanceof TirOptT )
    {
        const optConstrName = decl.name.text;
        if(!(
            optConstrName === "Some"
            || optConstrName === "None"
        ))
        return ctx.error(
            DiagnosticCode.Construcotr_0_is_not_part_of_the_definiton_of_1,
            decl.name.range, decl.name.text, namedDestructableType.toString()
        );

        const deconstructedFields = _getDeconstructedFields(
            ctx,
            decl,
            new TirStructConstr(
                optConstrName,
                optConstrName === "Some" ? [
                    new TirStructField(
                        "value",
                        namedDestructableType.typeArg
                    )
                ] : [],
            )
        );
        if( !deconstructedFields ) return undefined;
        const [ fieds, rest ] = deconstructedFields;

        return new TirNamedDeconstructVarDecl(
            decl.name.text,
            fieds,
            rest,
            finalVarType,
            initExpr,
            decl.flags,
            decl.range
        );
    }
}
export function _compileSingleDeconstructVarDecl(
    ctx: AstCompilationCtx,
    decl: SingleDeconstructVarDecl,
    typeHint: TirType | undefined, // coming from deconstructing
    // useful to infer variable type by usage
    // sameLevelStmts: readonly PebbleStmt[],
    // stmtIdx: number
): TirVarDecl | undefined
{
    const typeAndExpr = _getVarDeclTypeAndExpr( ctx, decl, typeHint  );
    if( !typeAndExpr ) return undefined;
    const [ finalVarType, initExpr ] = typeAndExpr;

    const finalStructType = getStructType( finalVarType );
    if( !finalStructType )
        return ctx.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            decl.range, finalVarType.toString(), "Struct"
        );
    if( finalStructType.constructors.length !== 1 )
        return ctx.error(
            DiagnosticCode.Deconstructing_0_requires_the_name_of_the_constructor,
            decl.range, finalVarType.toString()
        );

    const deconstructedFields = _getDeconstructedFields(
        ctx,
        decl,
        finalStructType.constructors[0]
    );
    if( !deconstructedFields ) return undefined;
    const [ fieds, rest ] = deconstructedFields;

    return new TirSingleDeconstructVarDecl(
        fieds,
        rest,
        finalVarType,
        initExpr,
        decl.flags,
        decl.range
    );
}
export function _compileArrayLikeDeconstr(
    ctx: AstCompilationCtx,
    decl: ArrayLikeDeconstr,
    typeHint: TirType | undefined, // coming from deconstructing
    // useful to infer variable type by usage
    // sameLevelStmts: readonly PebbleStmt[],
    // stmtIdx: number
): TirArrayLikeDeconstr | undefined
{
    const typeAndExpr = _getVarDeclTypeAndExpr( ctx, decl, typeHint );
    if( !typeAndExpr ) return undefined;
    const [ finalVarType, initExpr ] = typeAndExpr;

    const elemsType = getListTypeArg( finalVarType );
    if( !elemsType ) return ctx.error(
        DiagnosticCode.Type_0_is_not_assignable_to_type_1,
        decl.range, finalVarType.toString(), "List"
    );

    const elements: TirVarDecl[] = [];
    for( const declElem of decl.elements )
    {
        const compiled = _compileVarDecl(
            ctx,
            declElem,
            elemsType,
            // sameLevelStmts,
            // stmtIdx
        );
        if( !compiled ) return undefined;
        elements.push( compiled );
    }

    let rest: string | undefined = undefined;
    if( decl.rest )
    {
        rest = decl.rest.text;
        const success = ctx.scope.defineValue({
            name: rest,
            type: finalVarType, // same list type
            isConstant: decl.isConst()
        });
        if( !success ) return ctx.error(
            DiagnosticCode.Duplicate_identifier_0,
            decl.rest.range, decl.rest.text
        );
    }
    
    return new TirArrayLikeDeconstr(
        elements,
        rest,
        finalVarType,
        initExpr,
        decl.flags,
        decl.range
    );
}
export function _getDeconstructedFields(
    ctx: AstCompilationCtx,
    astDeconstruct: ISingleDeconstructVarDecl,
    ctorDef: TirStructConstr
): [
    fields: Map<string, TirVarDecl>,
    rest: string | undefined
] | undefined
{
    const tirFields: Map<string, TirVarDecl> = new Map();
    const ctorDefFieldNames = ctorDef.fields.map( f => f.name );
    const ctorNamesAlreadySpecified: string[] = [];
    for( const [ fieldIdentifier, varDecl ] of astDeconstruct.fields )
    {
        const fieldName = fieldIdentifier.text;
        if( !ctorDefFieldNames.includes( fieldName ) )
            return ctx.error(
                DiagnosticCode.Field_0_is_not_part_of_the_1_constructor_for_2_struct,
                fieldIdentifier.range, fieldName, ctorDef.name
            );
        if( ctorNamesAlreadySpecified.includes( fieldName ) )
            return ctx.error(
                DiagnosticCode.Duplicate_identifier_0,
                fieldIdentifier.range, fieldName
            );
        ctorNamesAlreadySpecified.push( fieldName );

        // adds to scope "simple" var decls
        const tirVarDecl = _compileVarDecl(
            ctx,
            varDecl,
            ctorDef.fields.find( f => f.name === fieldName )!.type,
        );
        if( !tirVarDecl ) return undefined;

        tirFields.set( fieldName, tirVarDecl );
    }
    if( astDeconstruct.rest && ctorDefFieldNames.length === ctorNamesAlreadySpecified.length )
        return ctx.error(
            DiagnosticCode.Invalid_rest_parameter_there_are_no_more_fields,
            astDeconstruct.rest.range
        );

    let rest: string | undefined = astDeconstruct.rest ? astDeconstruct.rest.text : undefined;
    return [ tirFields, rest ];
}
export function _getVarDeclTypeAndExpr(
    ctx: AstCompilationCtx,
    decl: { type: AstTypeExpr | undefined, initExpr: PebbleExpr | undefined, range: SourceRange },
    deconstructTypeHint: TirType | undefined, // coming from deconstructing
    // sameLevelStmts: readonly PebbleStmt[],
    // stmtIdx: number
): [
    varType: TirType,
    varInitExpr: TirExpr | undefined // undefined in case of deconstruction
] | undefined
{
    const declarationType = decl.type ? _compileConcreteTypeExpr( ctx, decl.type ) : undefined;
    // const typeHint = (
    //     declarationType ??
    //     undefined
    //     // _tryInferVarTypeByUsage(
    //     //     decl.name.text,
    //     //     sameLevelStmts,
    //     //     stmtIdx
    //     // )
    // );
    const typeHint = deconstructTypeHint ?? declarationType;

    // even in deconstructions
    // we allow for `as` type assertions
    // and we store the type to be converted to in the var decl type
    // here we check that the type assertion is valid
    if( declarationType && deconstructTypeHint )
    {
        // TODO: is data really a special case? or should we check for casts in general?

        // special case for deconstructed data
        // we need to check for casts
        if( deconstructTypeHint instanceof TirDataT )
        {
            if( !canCastToData( declarationType ) )
            return ctx.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                decl.type!.range, declarationType.toString(), typeHint!.toString()
            );
        }
        else if( !canAssignTo( declarationType, typeHint! ) )
        return ctx.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            decl.type!.range, declarationType.toString(), typeHint!.toString()
        );
    }

    let initExpr: TirExpr | undefined = undefined;
    if( decl.initExpr )
    {
        initExpr = _compileExpr( ctx, decl.initExpr, typeHint );
        if( !initExpr ) return undefined;
        if( typeHint && !canAssignTo( initExpr.type, typeHint ) )
            return ctx.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                decl.initExpr.range, initExpr.type.toString(), typeHint.toString()
            );
    }

    const finalVarType = typeHint ?? initExpr?.type;

    if( !finalVarType )
    return ctx.error(
        DiagnosticCode.Cannot_infer_variable_type_Try_to_make_the_type_explicit,
        decl.range
    );

    return [ finalVarType, initExpr ];
}
