import { FuncDecl } from "../../ast/nodes/statements/declarations/FuncDecl";
import { StructDecl } from "../../ast/nodes/statements/declarations/StructDecl";
import { TypeAliasDecl } from "../../ast/nodes/statements/declarations/TypeAliasDecl";
import { ExportStarStmt } from "../../ast/nodes/statements/ExportStarStmt";
import { ImportStarStmt } from "../../ast/nodes/statements/ImportStarStmt";
import { ImportStmt } from "../../ast/nodes/statements/ImportStmt";
import { PebbleStmt } from "../../ast/nodes/statements/PebbleStmt";
import { TypeImplementsStmt } from "../../ast/nodes/statements/TypeImplementsStmt";
import { Source, SourceKind } from "../../ast/Source/Source";
import { SourceRange } from "../../ast/Source/SourceRange";
import { extension } from "../../common";
import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { DiagnosticCode } from "../../diagnostics/diagnosticMessages.generated";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { Parser } from "../../parser/Parser";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";
import { getInternalPath, InternalPath, resolveProjAbsolutePath } from "../path/path";
import { getAppliedTypeInternalName, Scope, ScopeInfos } from "./scope/Scope";
import { TirProgram } from "../tir/program/TirProgram";
import { any_list_t, any_optional_t, bool_t, bytes_t, int_t, preludeScope, string_t, void_t } from "./scope/stdScope/stdScope";
import { TirSource } from "../tir/program/TirSource";
import { TirStmt } from "../tir/statements/TirStmt";
import { isTirExpr, TirExpr } from "../tir/expressions/TirExpr";
import { UnaryExclamation } from "../../ast/nodes/expr/unary/UnaryExclamation";
import { TirUnaryExclamation } from "../tir/expressions/unary/TirUnaryExclamation";
import { TirDataT, TirFuncT, TirLinearMapT, TirListT, TirOptT } from "../tir/types/TirNativeType";
import { canAssignTo, getNamedDestructableType, getStructType, isStructOrStructAlias } from "../tir/types/type-check-utils/canAssignTo";
import { UnaryPlus } from "../../ast/nodes/expr/unary/UnaryPlus";
import { UnaryMinus } from "../../ast/nodes/expr/unary/UnaryMinus";
import { TirUnaryPlus } from "../tir/expressions/unary/TirUnaryPlus";
import { TirUnaryMinus } from "../tir/expressions/unary/TirUnaryMinus";
import { UnaryTilde } from "../../ast/nodes/expr/unary/UnaryTilde";
import { TirUnaryTilde } from "../tir/expressions/unary/TirUnaryTilde";
import { isLitteralExpr, LitteralExpr } from "../../ast/nodes/expr/litteral/LitteralExpr";
import { LitVoidExpr } from "../../ast/nodes/expr/litteral/LitVoidExpr";
import { TirLitVoidExpr } from "../tir/expressions/litteral/TirLitVoidExpr";
import { LitTrueExpr } from "../../ast/nodes/expr/litteral/LitTrueExpr";
import { TirLitTrueExpr } from "../tir/expressions/litteral/TirLitTrueExpr";
import { TirLitFalseExpr } from "../tir/expressions/litteral/TirLitFalseExpr";
import { LitFalseExpr } from "../../ast/nodes/expr/litteral/LitFalseExpr";
import { LitStrExpr } from "../../ast/nodes/expr/litteral/LitStrExpr";
import { TirLitStrExpr } from "../tir/expressions/litteral/TirLitStrExpr";
import { LitIntExpr } from "../../ast/nodes/expr/litteral/LitIntExpr";
import { TirLitIntExpr } from "../tir/expressions/litteral/TirLitIntExpr";
import { LitHexBytesExpr } from "../../ast/nodes/expr/litteral/LitHexBytesExpr";
import { TirLitHexBytesExpr } from "../tir/expressions/litteral/TirLitHexBytesExpr";
import { LitThisExpr } from "../../ast/nodes/expr/litteral/LitThisExpr";
import { TirLitThisExpr } from "../tir/expressions/litteral/TirLitThisExpr";
import { LitArrExpr } from "../../ast/nodes/expr/litteral/LitArrExpr";
import { PebbleAnyTypeSym, PebbleConcreteTypeSym, PebbleGenericSym, PebbleValueSym } from "./scope/symbols/PebbleSym";
import { TirLitArrExpr } from "../tir/expressions/litteral/TirLitArrExpr";
import { TirAliasType } from "../tir/types/TirAliasType";
import { isTirType, TirType } from "../tir/types/TirType";
import { getListTypeArg } from "../tir/types/type-check-utils/getListTypeArg";
import { LitObjExpr } from "../../ast/nodes/expr/litteral/LitObjExpr";
import { LitUndefExpr } from "../../ast/nodes/expr/litteral/LitUndefExpr";
import { LitNamedObjExpr } from "../../ast/nodes/expr/litteral/LitNamedObjExpr";
import { TirLitUndefExpr } from "../tir/expressions/litteral/TirLitUndefExpr";
import { TirLitObjExpr } from "../tir/expressions/litteral/TirLitObjExpr";
import { TirLitNamedObjExpr } from "../tir/expressions/litteral/TirLitNamedObjExpr";
import { StructFlags, TirStructConstr, TirStructField, TirStructType } from "../tir/types/TirStructType";
import { ParentesizedExpr } from "../../ast/nodes/expr/ParentesizedExpr";
import { FuncExpr } from "../../ast/nodes/expr/functions/FuncExpr";
import { CallExpr } from "../../ast/nodes/expr/functions/CallExpr";
import { IsExpr } from "../../ast/nodes/expr/IsExpr";
import { ElemAccessExpr } from "../../ast/nodes/expr/ElemAccessExpr";
import { TernaryExpr } from "../../ast/nodes/expr/TernaryExpr";
import { DotPropAccessExpr, isPropAccessExpr, NonNullPropAccessExpr, OptionalPropAccessExpr, PropAccessExpr } from "../../ast/nodes/expr/PropAccessExpr";
import { CaseExpr, CaseExprMatcher } from "../../ast/nodes/expr/CaseExpr";
import { TypeConversionExpr } from "../../ast/nodes/expr/TypeConversionExpr";
import { NonNullExpr } from "../../ast/nodes/expr/unary/NonNullExpr";
import { IfStmt } from "../../ast/nodes/statements/IfStmt";
import { TirIfStmt } from "../tir/statements/TirIfStmt";
import { VarStmt } from "../../ast/nodes/statements/VarStmt";
import { ForStmt } from "../../ast/nodes/statements/ForStmt";
import { ForOfStmt } from "../../ast/nodes/statements/ForOfStmt";
import { BlockStmt } from "../../ast/nodes/statements/BlockStmt";
import { AssertStmt } from "../../ast/nodes/statements/AssertStmt";
import { BreakStmt } from "../../ast/nodes/statements/BreakStmt";
import { ContinueStmt } from "../../ast/nodes/statements/ContinueStmt";
import { EmptyStmt } from "../../ast/nodes/statements/EmptyStmt";
import { FailStmt } from "../../ast/nodes/statements/FailStmt";
import { MatchStmt, MatchStmtCase } from "../../ast/nodes/statements/MatchStmt";
import { ReturnStmt } from "../../ast/nodes/statements/ReturnStmt";
import { TestStmt } from "../../ast/nodes/statements/TestStmt";
import { WhileStmt } from "../../ast/nodes/statements/WhileStmt";
import { ExportImportStmt } from "../../ast/nodes/statements/ExportImportStmt";
import { AddAssignmentStmt, AssignmentStmt, BitwiseAndAssignmentStmt, BitwiseOrAssignmentStmt, BitwiseXorAssignmentStmt, DivAssignmentStmt, ExpAssignmentStmt, ExplicitAssignmentStmt, isAssignmentStmt, isExplicitAssignmentStmt, LogicalAndAssignmentStmt, LogicalOrAssignmentStmt, ModuloAssignmentStmt, MultAssignmentStmt, ShiftLeftAssignmentStmt, ShiftRightAssignmentStmt, SimpleAssignmentStmt, SubAssignmentStmt } from "../../ast/nodes/statements/AssignmentStmt";
import { ExprStmt } from "../../ast/nodes/statements/ExprStmt";
import { VarDecl } from "../../ast/nodes/statements/declarations/VarDecl/VarDecl";
import { SimpleVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { NamedDeconstructVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/NamedDeconstructVarDecl";
import { ISingleDeconstructVarDecl, SingleDeconstructVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/SingleDeconstructVarDecl";
import { ArrayLikeDeconstr } from "../../ast/nodes/statements/declarations/VarDecl/ArrayLikeDeconstr";
import { AstTypeExpr } from "../../ast/nodes/types/AstTypeExpr";
import { AstBooleanType, AstBytesType, AstFuncType, AstIntType, AstLinearMapType, AstListType, AstNativeOptionalType, AstVoidType, isAstNativeTypeExpr } from "../../ast/nodes/types/AstNativeTypeExpr";
import { TirSimpleVarDecl } from "../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirNamedDeconstructVarDecl } from "../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSingleDeconstructVarDecl } from "../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirArrayLikeDeconstr } from "../tir/statements/TirVarDecl/TirArrayLikeDeconstr";
import { Identifier } from "../../ast/nodes/common/Identifier";
import { isTirVarDecl, TirVarDecl } from "../tir/statements/TirVarDecl/TirVarDecl";
import { TirForStmt } from "../tir/statements/TirForStmt";
import { IncrStmt } from "../../ast/nodes/statements/IncrStmt";
import { DecrStmt } from "../../ast/nodes/statements/DecrStmt";
import { TirAssignmentStmt } from "../tir/statements/TirAssignmentStmt";
import { TirAddExpr, TirBinaryExpr, TirBitwiseAndExpr, TirBitwiseOrExpr, TirBitwiseXorExpr, TirDivExpr, TirEqualExpr, TirExponentiationExpr, TirGreaterThanEqualExpr, TirGreaterThanExpr, TirLessThanEqualExpr, TirLessThanExpr, TirLogicalAndExpr, TirLogicalOrExpr, TirModuloExpr, TirMultExpr, TirNotEqualExpr, TirOptionalDefaultExpr, TirShiftLeftExpr, TirShiftRightExpr, TirSubExpr } from "../tir/expressions/binary/TirBinaryExpr";
import { TirVariableAccessExpr } from "../tir/expressions/TirVariableAccessExpr";
import { TirForOfStmt } from "../tir/statements/TirForOfStmt";
import { TirWhileStmt } from "../tir/statements/TirWhileStmt";
import { TirReturnStmt } from "../tir/statements/TirReturnStmt";
import { TirBlockStmt } from "../tir/statements/TirBlockStmt";
import { TirBreakStmt } from "../tir/statements/TirBreakStmt";
import { TirContinueStmt } from "../tir/statements/TirContinueStmt";
import { TirFailStmt } from "../tir/statements/TirFailStmt";
import { TirAssertStmt } from "../tir/statements/TirAssertStmt";
import { TirTestStmt } from "../tir/statements/TirTestStmt";
import { TirMatchStmt, TirMatchStmtCase } from "../tir/statements/TirMatchStmt";
import { DeconstructableTirType, getDeconstructableType } from "../tir/types/type-check-utils/getDeconstructableType";
import { UsingStmt } from "../../ast/nodes/statements/UsingStmt";
import { isPebbleAstTypeDecl } from "../../ast/nodes/statements/declarations/PebbleAstTypeDecl";
import { TirExprStmt } from "../tir/statements/TirExprStmt";
import { TirFuncDecl } from "../tir/statements/TirFuncDecl";
import { PebbleExpr } from "../../ast/nodes/expr/PebbleExpr";
import { isUnaryPrefixExpr, UnaryPrefixExpr } from "../../ast/nodes/expr/unary/UnaryPrefixExpr";
import { TirUnaryPrefixExpr } from "../tir/expressions/unary/TirUnaryPrefixExpr";
import { TirNonNullExpr } from "../tir/expressions/TirNonNullExpr";
import { getOptTypeArg } from "../tir/types/type-check-utils/getOptTypeArg";
import { TirFuncExpr } from "../tir/expressions/TirFuncExpr";
import { getUnaliased } from "../tir/types/type-check-utils/getUnaliased";
import { TirTypeParam } from "../tir/types/TirTypeParam";
import { getInternalVarName } from "../internalVar";
import { TirCallExpr } from "../tir/expressions/TirCallExpr";
import { TirCaseExpr, TirCaseExprMatcher } from "../tir/expressions/TirCaseExpr";
import { TirTypeConversionExpr } from "../tir/expressions/TirTypeConversionExpr";
import { canCastTo, canCastToData } from "../tir/types/type-check-utils/canCastTo";
import { TirIsExpr } from "../tir/expressions/TirIsExpr";
import { TirElemAccessExpr } from "../tir/expressions/TirElemAccessExpr";
import { TirTernaryExpr } from "../tir/expressions/TirTernaryExpr";
import { TirDotPropAccessExpr, TirOptionalPropAccessExpr, TirPropAccessExpr } from "../tir/expressions/TirPropAccessExpr";
import { AstNamedTypeExpr } from "../../ast/nodes/types/AstNamedTypeExpr";
import { AddExpr, BinaryExpr, BitwiseAndExpr, BitwiseOrExpr, BitwiseXorExpr, DivExpr, EqualExpr, ExponentiationExpr, GreaterThanEqualExpr, GreaterThanExpr, isBinaryExpr, LessThanEqualExpr, LessThanExpr, LogicalAndExpr, LogicalOrExpr, ModuloExpr, MultExpr, NotEqualExpr, OptionalDefaultExpr, ShiftLeftExpr, ShiftRightExpr, SubExpr } from "../../ast/nodes/expr/binary/BinaryExpr";
import { ExportStmt } from "../../ast/nodes/statements/ExportStmt";
import { ResolveStackNode } from "./utils/deps/ResolveStackNode";
import { getPropAccessReturnType } from "./utils/getPropAccessReturnType";
import { wrapManyStatements } from "./utils/wrapManyStatementsOrReturnSame";
import { AstCompilationCtx } from "./AstCompilationCtx";
import { _compileStatement } from "./internal/statements/_compileStatement";

/*
Handling type expressions that depend on other types 
(such as generics, function return types, and inferred types from complex expressions)
requires a more structured approach. 

This typically involves a two-pass system:

    1) First Pass (Declaration & Collection): 
        Collect all type information and dependencies.

    2) Second Pass (Resolution & Inference): 
        Resolve dependent types, infer missing types, 
        and enforce type consistency.
*/
 
/**
 * compiles Pebble AST to Typed IR.
 * 
 * AST -> TIR
 * 
 * The AST is simply the result of tokenization and parsing.
 * 
 * Therefore the AST is only syntactically correct, but not necessarily semantically correct.
 * 
 * During the compilation from AST to TIR,
 * missign types are inferred and the resulting TIR is checked for semantic correctness.
 * 
 * In short, here is where type checking happens.
 */
export class AstCompiler extends DiagnosticEmitter
    implements IPebbleCompiler
{
    /** 
     * The standard library scope.
     * 
     * (ScriptContext, built-in functions, etc.)
    **/
    readonly preludeScope: Scope;
    readonly program: TirProgram;
    readonly parsedAstSources: Map<InternalPath, Source> = new Map();

    constructor(
        entry: string,
        readonly cfg: CompilerOptions,
        readonly rootPath: string = "/",
        readonly io: CompilerIoApi = createMemoryCompilerIoApi({ useConsoleAsOutput: true }),
        diagnostics?: DiagnosticMessage[]
    )
    {
        super( diagnostics );
        this.preludeScope = preludeScope.clone();
        this.preludeScope.readonly();
        entry = resolveProjAbsolutePath( getInternalPath( entry ), rootPath )!;
        this.program = new TirProgram( entry );
    }

    async compileFile( path: string )
    {
        const src = await this.sourceFromInternalPath( getInternalPath( path ) );
        if( !src ) return this.diagnostics;
        await this.parseAllImportedFiles(
            ResolveStackNode.entry( src )
        );
        if( this.diagnostics.length > 0 ) return this.diagnostics;

        return this._compileParsedSource( src );
    }

    /**
     * translates the source AST statements
     * to TIR statements; and saves the result in `this.program`
     */
    private async _compileParsedSource( src: Source ): Promise<DiagnosticMessage[]>
    {
        if( src.statements.length === 0 ) return this.diagnostics;

        const tirSource = new TirSource(
            resolveProjAbsolutePath( src.internalPath, this.rootPath )!,
            preludeScope
        );
        this._compileSourceStatements( tirSource, src.statements )

        this.program.files.set(
            src.internalPath,
            tirSource
        );

        return this.diagnostics;
    }
    private _compileSourceStatements( tirSource: TirSource, stmts: PebbleStmt[] ): void
    {
        if( tirSource.compiled ) return;

        // clone array so we don't remove stmts from the original AST
        stmts = stmts.slice();

        // defines imported symbols on top level scope, modifies stmts array
        this._collectImports( tirSource, stmts );

        // collect top level **type** (struct and aliases) declarations
        this._collectTypeDeclarations( tirSource, stmts );

        // collect top level **interface** declarations
        // this._collectInterfaceDeclarations( tirSource, stmts );

        // adds interface **implementations** to types declared in this file
        // this._applyInterfaceImplementations( tirSource, stmts );

        // compile **value** statements
        const srcCompileCtx = AstCompilationCtx.fromScopeOnly( tirSource.scope, this.diagnostics );
        const nAstStmts = stmts.length;
        for( let i = 0; i < nAstStmts; i++ )
        {
            const stmt = stmts[i];
            const tirStmts = _compileStatement( srcCompileCtx, stmt, tirSource );

            // if statement compilation failed, skip to next statement
            if( !Array.isArray( tirStmts ) ) continue;

            tirSource.statements.push(
                ...tirStmts
            );
        }

        tirSource.compiled = true;
    }

    private _collectTypeDeclarations( tirSource: TirSource, stmts: PebbleStmt[] ): void
    {
        for( let i = 0; i < stmts.length; i++ )
        {
            let stmt = stmts[i];
            let exported = false;
            if( stmt instanceof ExportStmt )
            {
                exported = true;
                stmt = stmt.stmt;
            }
            if(
                stmt instanceof StructDecl
                || stmt instanceof TypeAliasDecl
            ) {
                const typeSym = stmt instanceof StructDecl
                    ? this._compileStructDecl( tirSource, stmt )
                    : this._compileTypeAliasDecl( tirSource, stmt );

                if( !typeSym ) continue;

                if( !tirSource.scope.defineType( typeSym ) ) this.error(
                    DiagnosticCode._0_is_already_defined,
                    stmt.name.range,
                    stmt.name.text
                );

                if( exported )
                {
                    if( tirSource.exportedTypeNames.has( stmt.name.text ) ) this.error(
                        DiagnosticCode._0_is_already_exported,
                        stmt.name.range,
                        stmt.name.text
                    );
                    else void tirSource.exportedTypeNames.add( stmt.name.text );
                }

                // remove from array so we don't process it again
                void stmts.splice( i, 1 );
                i--;
            }
        }
    }

    private _compileStructDecl( tirSource: TirSource, stmt: StructDecl ): PebbleAnyTypeSym
    {
        if( stmt.typeParams.length > 0 ) throw new Error("not_implemented::AstCompiler::_compileStructDecl::typeParams");
        const self = this;
        const structType = new TirStructType(
            stmt.name.text,
            stmt.constrs.map( ctor =>
                new TirStructConstr(
                    ctor.name.text,
                    ctor.fields.map( f => {

                        if( !f.type ) return self.error(
                            DiagnosticCode._0_is_not_defined,
                            f.name.range, f.name.text
                        );

                        // TODO: recursive struct definitions
                        const fieldType  = self._compileConcreteTypeExpr(
                            AstCompilationCtx.fromScopeOnly( tirSource.scope, this.diagnostics ),
                            f.type
                        );
                        if( !fieldType ) return undefined;

                        return new TirStructField(
                            f.name.text,
                            fieldType
                        );
                    })
                    .filter( f => f instanceof TirStructField ) as TirStructField[]
                )
            ),
            [], // impls
            // TODO: handle struct flags
            StructFlags.None
        );
        return new PebbleConcreteTypeSym({
            name: stmt.name.text,
            concreteType: structType,
        });
    }

    private _compileTypeAliasDecl( tirSource: TirSource, stmt: TypeAliasDecl ): PebbleAnyTypeSym | undefined
    {
        if( stmt.typeParams.length > 0 ) throw new Error("not_implemented::AstCompiler::_compileTypeAliasDecl::typeParams");
        const self = this;
        const aliasedType = self._compileConcreteTypeExpr(
            AstCompilationCtx.fromScopeOnly( tirSource.scope, this.diagnostics ),
            stmt.aliasedType
        );
        if( !aliasedType ) return undefined;
        const aliasType = new TirAliasType(
            stmt.name.text,
            aliasedType,
            [] // interface implementations
        );
        return new PebbleConcreteTypeSym({
            name: stmt.name.text,
            concreteType: aliasType
        })
    }

    private _collectImports( tirSource: TirSource, stmts: PebbleStmt[] ): void
    {
        const srcPath = tirSource.internalPath + extension;
        for( let i = 0; i < stmts.length; i++ )
        {
            const stmt = stmts[i];
            if( stmt instanceof ImportStarStmt )
            {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    stmt.range, "import *"
                );
                continue;
            }
            if(!(
                stmt instanceof ImportStmt
            )) continue;

            const projAbsoultePath = getInternalPath( resolveProjAbsolutePath( stmt.fromPath.string, this.rootPath ) ?? "" );
            // console.log(projAbsoultePath, [ ...this.program.files.keys() ]);
            const importedSource = this.program.files.get( projAbsoultePath );
            if( !importedSource )
            {
                return this.error(
                    DiagnosticCode.File_0_not_found,
                    stmt.fromPath.range,
                    stmt.fromPath.string
                );
            }

            if(
                importedSource.exportedValueNames.size === 0
                && importedSource.exportedTypeNames.size === 0
            ) {
                this.error(
                    DiagnosticCode.File_0_has_no_exports,
                    stmt.fromPath.range,
                    stmt.fromPath.string
                );
                continue;
            }

            for( const importDecl of stmt.members )
            {
                const declName = importDecl.identifier.text;
                const isValue = importedSource.exportedValueNames.has( declName );
                const isType = importedSource.exportedTypeNames.has( declName );

                if( !isValue && !isType ) {
                    this.error(
                        DiagnosticCode.Module_0_has_no_exported_member_1,
                        importDecl.identifier.range,
                        stmt.fromPath.string,
                        declName,
                    );
                    continue;
                }

                // define on source top level scope
                if( isValue )
                {
                    const result = importedSource.scope.resolveValue( declName );
                    if( !result ) throw new Error("unreachable::AstCompiler::_compileSourceStatements::importedSource.scope.resolveValue");
                    const valueSym = result[0];

                    if( !tirSource.importsScope.defineValue( valueSym ) ) this.error(
                        DiagnosticCode._0_is_already_defined,
                        importDecl.identifier.range,
                        declName
                    );
                }
                if( isType )
                {
                    const typeSym = importedSource.scope.resolveType( declName );
                    if( !typeSym ) throw new Error("unreachable::AstCompiler::_compileSourceStatements::importedSource.scope.resolveType");
                    
                    if( !tirSource.importsScope.defineType( typeSym ) ) this.error(
                        DiagnosticCode._0_is_already_defined,
                        importDecl.identifier.range,
                        declName
                    );
                }
            }

            // remove from array so we don't process it again
            void stmts.splice( i, 1 );
            i--;
        }
    }
    
    private _compileFuncDecl(
        ctx: AstCompilationCtx,
        stmt: FuncDecl
    ): [ TirFuncDecl ] | undefined
    {
        const expr = this._compileFuncExpr(
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
    private _compileFuncExpr(
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

        /*
        expr.name: Identifier,
        expr.typeParams: Identifier[],
        expr.signature: AstFuncType,
        expr.body: BlockStmt | PebbleExpr,
        expr.arrowKind: ArrowKind,
        expr.range: SourceRange
        */

        const funcName = expr.name.text;

        const funcCtx = ctx.newFunctionChildScope( funcName );

        if( this._hasDuplicateTypeParams( expr.typeParams ) ) return undefined;

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
            const tirParam = this._compileVarDecl(
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

        const signatureReturnType = expr.signature.returnType ? this._compileConcreteTypeExpr(
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

        const compileResult = this._compileBlockStmt(
            funcCtx,
            astBody
        );
        if( !compileResult ) return undefined;
        const body = compileResult[0];

        body.stmts.unshift( ...blockInitStmts );

        const returnType = functionCtx.returnHints.type;
        if( !returnType ) return this.error(
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
    private _hasDuplicateTypeParams( typeParams: Identifier[] ): boolean
    {
        const typeParamNames = new Set<string>();
        let result = false;
        for( const tp of typeParams )
        {
            if( typeParamNames.has( tp.text ) )
            {
                this.error(
                    DiagnosticCode.Duplicate_identifier_0,
                    tp.range, tp.text
                );
                result = true;
            }
            typeParamNames.add( tp.text );
        }
        return result;
    }
    
    /**
     * `using` only introduces symbols in scope
     * 
     * we don't represent `using` statements in the TIR
     * 
     * @returns {[]} an empty array if successful compilation
     * @returns {undefined} `undefined` if compilation failed
    **/
    private _compileUsingStmt(
        ctx: AstCompilationCtx,
        stmt: UsingStmt
    ): [] | undefined
    {
        stmt.constructorNames;
        stmt.structTypeExpr;
        stmt.range;

        const structOrAliasType = this._compileConcreteTypeExpr( ctx, stmt.structTypeExpr );
        if( !structOrAliasType ) return undefined;

        // un-alias
        const structType = getStructType( structOrAliasType );
        if( !structType || !structType.isConcrete() ) return this.error(
            DiagnosticCode.Type_0_does_not_have_constructors,
            stmt.structTypeExpr.range, structOrAliasType.toString()
        );

        const defCtorNames = structType.constructors.map( c => c.name );
        const sameStmtCtorNames: string[] = [];

        for( const stmtCtor of stmt.constructorNames )
        {
            const stmtCtorNameId = stmtCtor.constructorName;
            const stmtCtorName = stmtCtorNameId.text;
            const stmtReassignedCtorName = stmtCtor.renamedConstructorName;

            if( !defCtorNames.includes( stmtCtorName ) ) return this.error(
                DiagnosticCode.Constructor_0_is_not_part_of_the_definition_of_1,
                stmtCtorNameId.range, stmtCtorName, structType.toString(),
            );
            if( sameStmtCtorNames.includes( stmtCtorName ) ) return this.error(
                DiagnosticCode.Constructor_0_was_already_specified,
                stmtCtorNameId.range, stmtCtorName
            );
            sameStmtCtorNames.push( stmtCtorName );

            const valid = ctx.scope.defineAviableConstructorIfValid(
                stmtReassignedCtorName?.text ?? stmtCtorName,
                stmtCtorName,
                structOrAliasType
            );
            if( !valid )
            return this.error(
                DiagnosticCode.Constructor_name_0_is_already_declared_in_this_scope,
                stmtCtorNameId.range, stmtCtorName
            );
        }

        return [];
    }

    private _compileExprStmt(
        ctx: AstCompilationCtx,
        stmt: ExprStmt
    ): [ TirExprStmt ] | undefined
    {
        const expr = this._compileExpr( ctx, stmt.expr, void_t );
        if( !expr ) return undefined;
        return [ new TirExprStmt( expr, stmt.range ) ];
    }

    private _compileMatchStmt(
        ctx: AstCompilationCtx,
        stmt: MatchStmt
    ): [ TirMatchStmt ] | undefined
    {
        if( !ctx.functionCtx ) return this.error(
            DiagnosticCode.A_match_statement_can_only_be_used_within_a_function_body,
            stmt.range
        );

        const matchExpr = this._compileExpr( ctx, stmt.matchExpr, undefined );
        if( !matchExpr ) return undefined;

        const matchExprType = matchExpr.type;
        const deconstructableType = getDeconstructableType( matchExprType );
        if( !deconstructableType ) return this.error(
            DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed,
            stmt.matchExpr.range, matchExprType.toString()
        );

        if( stmt.cases.length === 0 ) return this.error(
            DiagnosticCode.A_match_statement_must_have_at_least_one_case,
            stmt.range
        );

        const cases: TirMatchStmtCase[] = [];
        const constrNamesAlreadySpecified: string[] = [];
        for( const matchCase of stmt.cases )
        {
            const branch = this._compileTirMatchStmtCase(
                ctx,
                matchCase,
                deconstructableType,
                constrNamesAlreadySpecified
            );
            if( !branch ) return undefined;
            cases.push( branch );
        }

        return [ new TirMatchStmt(
            matchExpr,
            cases,
            stmt.range
        ) ];
    }
    private _compileTirMatchStmtCase(
        ctx: AstCompilationCtx,
        matchCase: MatchStmtCase,
        deconstructableType: DeconstructableTirType,
        constrNamesAlreadySpecified: string[]
    ): TirMatchStmtCase | undefined
    {
        const pattern = this._compileVarDecl( ctx, matchCase.pattern, deconstructableType );
        if( !pattern ) return undefined;

        if( pattern instanceof SimpleVarDecl ) 
            return this.error(
                DiagnosticCode.The_argument_of_a_match_statement_branch_must_be_deconstructed,
                matchCase.pattern.range
            );
        else if( pattern instanceof NamedDeconstructVarDecl ) {
            const deconstructedCtorIdentifier = pattern.name;
            const deconstructedCtorName = deconstructedCtorIdentifier.text;

            if( constrNamesAlreadySpecified.includes( deconstructedCtorName ) )
            return this.error(
                DiagnosticCode.Constructor_0_was_already_specified,
                deconstructedCtorIdentifier.range, deconstructedCtorName
            );
            constrNamesAlreadySpecified.push( deconstructedCtorName );

            if( deconstructableType instanceof TirDataT )
            {
                if(!(
                       deconstructedCtorName === "Constr"   // { index, fields, ...rest }
                    || deconstructedCtorName === "Map"      // { map, ...rest }
                    || deconstructedCtorName === "List"     // { list, ...rest }
                    || deconstructedCtorName === "B"        // { bytes, ...rest }
                    || deconstructedCtorName === "I"        // { int, ...rest }
                )) return this.error(
                    DiagnosticCode.Unknown_0_constructor_1,
                    pattern.name.range, "data", deconstructedCtorName
                );

                const branchCtx = ctx.newBranchChildScope();

                const branchArg = this._compileNamedDeconstructVarDecl(
                    branchCtx,
                    pattern,
                    deconstructableType
                );
                if( !branchArg ) return undefined;
                const branchBody = wrapManyStatements(
                    _compileStatement(
                        branchCtx,
                        matchCase.body
                    ),
                    matchCase.body.range
                );
                if( !branchBody ) return undefined;

                return new TirMatchStmtCase(
                    branchArg,
                    branchBody,
                    matchCase.range
                );
            }
            else if( deconstructableType instanceof TirOptT )
            {
                if(!(
                       deconstructedCtorName === "Some"     // { value, ...rest }
                    || deconstructedCtorName === "None"     // { ...rest }
                )) return this.error(
                    DiagnosticCode.Unknown_0_constructor_1,
                    pattern.name.range, "Optional", deconstructedCtorName
                );

                const branchCtx = ctx.newBranchChildScope();

                const branchArg = this._compileNamedDeconstructVarDecl(
                    branchCtx,
                    pattern,
                    deconstructableType
                );
                if( !branchArg ) return undefined;
                const branchBody = wrapManyStatements(
                    _compileStatement(
                        branchCtx,
                        matchCase.body
                    ),
                    matchCase.body.range
                );
                if( !branchBody ) return undefined;

                return new TirMatchStmtCase(
                    branchArg,
                    branchBody,
                    matchCase.range
                );
            }
            else if( deconstructableType instanceof TirStructType )
            {
                const ctorDef = deconstructableType.constructors.find( c => c.name === deconstructedCtorName );
                if( !ctorDef ) return this.error(
                    DiagnosticCode.Unknown_0_constructor_1,
                    pattern.name.range, deconstructableType.toString(), deconstructedCtorName
                );

                const branchCtx = ctx.newBranchChildScope();

                const branchArg = this._compileNamedDeconstructVarDecl(
                    branchCtx,
                    pattern,
                    deconstructableType
                );
                if( !branchArg ) return undefined;
                const branchBody = wrapManyStatements(
                    _compileStatement(
                        branchCtx,
                        matchCase.body
                    ),
                    matchCase.body.range
                );
                if( !branchBody ) return undefined;

                return new TirMatchStmtCase(
                    branchArg,
                    branchBody,
                    matchCase.range
                );
            }
            // else if( deconstructableType instanceof TirListT )
            // else if( deconstructableType instanceof TirLinearMapT )
            else return this.error(
                DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed_by_named_object,
                matchCase.pattern.range, deconstructableType.toString()
            )
        }
        else if( pattern instanceof SingleDeconstructVarDecl )
        {
            if(!( deconstructableType instanceof TirStructType ))
            return this.error(
                DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed_as_unnamed_object,
                matchCase.pattern.range, deconstructableType.toString()
            );

            if( deconstructableType.constructors.length !== 1 )
            return this.error(
                DiagnosticCode.A_value_of_type_0_has_multiple_constructors,
                matchCase.pattern.range, deconstructableType.toString()
            );

            const branchCtx = ctx.newBranchChildScope();

            const branchArg = this._compileSingleDeconstructVarDecl(
                branchCtx,
                pattern,
                deconstructableType
            );
            if( !branchArg ) return undefined;
            const branchBody = wrapManyStatements(
                _compileStatement(
                    branchCtx,
                    matchCase.body
                ),
                matchCase.body.range
            );
            if( !branchBody ) return undefined;

            return new TirMatchStmtCase(
                branchArg,
                branchBody,
                matchCase.range
            );
        }
        else if( pattern instanceof ArrayLikeDeconstr )
        {
            if(!(
                deconstructableType instanceof TirListT
                || deconstructableType instanceof TirLinearMapT
            )) return this.error(
                DiagnosticCode.A_value_of_type_0_cannot_be_deconstructed_as_an_array,
                matchCase.pattern.range, deconstructableType.toString()
            );

            const branchCtx = ctx.newBranchChildScope();

            const branchArg = this._compileArrayLikeDeconstr(
                branchCtx,
                pattern,
                deconstructableType
            );
            if( !branchArg ) return undefined;
            const branchBody = wrapManyStatements(
                _compileStatement(
                    branchCtx,
                    matchCase.body
                ),
                matchCase.body.range
            );
            if( !branchBody ) return undefined;

            return new TirMatchStmtCase(
                branchArg,
                branchBody,
                matchCase.range
            );
        }
    }

    private _compileTestStmt(
        ctx: AstCompilationCtx,
        stmt: TestStmt
    ): [ TirTestStmt ] | undefined
    {
        if( ctx.functionCtx ) return this.error(
            DiagnosticCode.A_test_statement_can_only_be_used_outside_a_function,
            stmt.range
        );

        let tirBody = wrapManyStatements(
            _compileStatement(
                ctx.newBranchChildScope(),
                stmt.body
            ),
            stmt.body.range
        );
        if( !tirBody ) return undefined;
        if(!( tirBody instanceof TirBlockStmt))
        {
            tirBody = new TirBlockStmt( [ tirBody ], stmt.body.range );
        }

        return [ new TirTestStmt(
            stmt.testName?.string,
            tirBody as TirBlockStmt,
            stmt.range
        ) ];
    }

    private _compileAssertStmt(
        ctx: AstCompilationCtx,
        stmt: AssertStmt
    ): [ TirAssertStmt ] | undefined
    {
        const tirCond = this._compileExpr( ctx, stmt.condition, bool_t );
        if( !tirCond ) return undefined;
        if(
            !canAssignTo( tirCond.type, bool_t )
            && !canAssignTo( tirCond.type, any_optional_t )
        ) {
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.condition.range, tirCond.type.toString(), bool_t.toString()
            );
        }

        let failMsgExpr: TirExpr | undefined = undefined;
        if( stmt.elseExpr )
        {
            failMsgExpr = this._compileExpr( ctx, stmt.elseExpr, string_t );
            if( !failMsgExpr ) return undefined;

            if( canAssignTo( failMsgExpr.type, bytes_t ) )
            {
                // auto cast to string
                failMsgExpr = new TirTypeConversionExpr(
                    failMsgExpr,
                    string_t,
                    failMsgExpr.range
                );
            }

            if( !canAssignTo( failMsgExpr.type, string_t ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.elseExpr.range, failMsgExpr.type.toString(), string_t.toString()
            );
        }

        return [ new TirAssertStmt( tirCond, failMsgExpr, stmt.range ) ];
    }

    private _compileFailStmt(
        ctx: AstCompilationCtx,
        stmt: FailStmt
    ): [ TirFailStmt ] | undefined
    {
        if( !ctx.functionCtx ) return this.error(
            DiagnosticCode.A_fail_statement_can_only_be_used_within_a_function_body,
            stmt.range
        );

        let failMsgExpr: TirExpr | undefined = undefined;
        if( stmt.value )
        {
            failMsgExpr = this._compileExpr( ctx, stmt.value, string_t );
            if( !failMsgExpr ) return undefined;
            if( !canAssignTo( failMsgExpr.type, string_t ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.value.range, failMsgExpr.type.toString(), string_t.toString()
            );
        }

        return [ new TirFailStmt( failMsgExpr, stmt.range ) ];
    }

    private _compileContinueStmt(
        ctx: AstCompilationCtx,
        stmt: ContinueStmt
    ): [ TirContinueStmt ] | undefined
    {
        if( !ctx.isLoop ) return this.error(
            DiagnosticCode.A_continue_statement_can_only_be_used_within_a_loop,
            stmt.range
        );
        return [ new TirContinueStmt( stmt.range ) ];
    }

    private _compileBreakStmt(
        ctx: AstCompilationCtx,
        stmt: BreakStmt
    ): [ TirBreakStmt ] | undefined
    {
        if( !ctx.isLoop ) return this.error(
            DiagnosticCode.A_break_statement_can_only_be_used_within_a_loop,
            stmt.range
        );
        return [ new TirBreakStmt( stmt.range ) ];
    }
    
    private _compileBlockStmt(
        ctx: AstCompilationCtx,
        stmt: BlockStmt,
    ): [ TirBlockStmt ] | undefined
    {
        const blockCtx = ctx.newBranchChildScope();
        // stmt.stmts;
        const tirStmts: TirStmt[] = [];
        for( const blockStmt of stmt.stmts )
        {
            const tirStmt = _compileStatement( blockCtx, blockStmt );
            if( !Array.isArray( tirStmt ) ) return undefined;
            tirStmts.push( ...tirStmt );
        }
        return [ new TirBlockStmt( tirStmts, stmt.range ) ];
    }

    private _compileReturnStmt(
        ctx: AstCompilationCtx,
        stmt: ReturnStmt
    ): [ TirReturnStmt ] | undefined
    {
        if( !ctx.functionCtx ) return this.error(
            DiagnosticCode.A_return_statement_can_only_be_used_within_a_function_body,
            stmt.range
        );
        const hintReturn = ctx.functionCtx.returnHints;
        const expr = stmt.value ?
        this._compileExpr(
            ctx,
            stmt.value,
            hintReturn.type
        ) : new TirLitVoidExpr( stmt.range );
        if( !expr ) return undefined;

        if( !hintReturn.type ) {
            hintReturn.type = expr.type;
            hintReturn.isInferred = true;
        }

        if( !canAssignTo( expr.type, hintReturn.type ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.value?.range ?? stmt.range, expr.type.toString(), hintReturn.type.toString()
        );

        return [ new TirReturnStmt( expr, stmt.range ) ];
    }

    private _compileWhileStmt(
        ctx: AstCompilationCtx,
        stmt: WhileStmt
    ): [ TirWhileStmt ] | undefined
    {
        const tirCond = this._compileExpr( ctx, stmt.condition, bool_t );
        if( !tirCond ) return undefined;
        if(
            !canAssignTo( tirCond.type, bool_t )
            && !canAssignTo( tirCond.type, any_optional_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.condition.range, tirCond.type.toString(), bool_t.toString()
        );

        const tirBody = wrapManyStatements(
            _compileStatement(
                ctx.newLoopChildScope(),
                stmt.body
            ),
            stmt.body.range
        );
        if( !tirBody ) return undefined;

        return [ new TirWhileStmt(
            tirCond,
            tirBody,
            stmt.range
        ) ];
    }

    private _compileForOfStmt(
        ctx: AstCompilationCtx,
        stmt: ForOfStmt
    ): [ TirForOfStmt ] | undefined
    {
        const iterableExpr = this._compileExpr(
            ctx,
            stmt.iterable,
            any_list_t
        );
        if( !iterableExpr ) return undefined;
        const elemsType = getListTypeArg( iterableExpr.type );
        if( !elemsType ) return this.error(
            DiagnosticCode.The_argument_of_a_for_of_statement_must_be_an_iterable,
            stmt.iterable.range
        );

        const loopCtx = ctx.newLoopChildScope();

        const varDecl = stmt.elemDeclaration.declarations[0];
        const tirVarDecl = this._compileVarDecl(
            loopCtx,
            varDecl,
            elemsType
        );
        if( !tirVarDecl ) return undefined;
        if( !canAssignTo( tirVarDecl.type, elemsType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            varDecl.range, tirVarDecl.type.toString(), elemsType.toString()
        );

        const tirBody = wrapManyStatements(
            _compileStatement(
                loopCtx,
                stmt.body
            ),
            stmt.body.range
        );
        if( !tirBody ) return undefined;

        return [ new TirForOfStmt(
            tirVarDecl,
            iterableExpr,
            tirBody,
            stmt.range
        ) ];
    }
    private _compileForStmt(
        ctx: AstCompilationCtx,
        stmt: ForStmt
    ): [ TirForStmt ] | undefined
    {
        const loopScope = ctx.newLoopChildScope();

        const tirInit = stmt.init ? this._compileVarStmt( loopScope, stmt.init, false ) : undefined;
        if( !tirInit ) return undefined;

        const tirCond = stmt.condition ? this._compileExpr( loopScope, stmt.condition, bool_t ) : undefined;
        if( !tirCond ) return undefined;

        const tirUpdates = this._compileForUpdateStmts( loopScope, stmt.updates );
        if( !tirUpdates ) return undefined;

        const tirBody = wrapManyStatements(
            _compileStatement(
                loopScope.newBranchChildScope(),
                stmt.body
            ),
            stmt.body.range
        );
        if( !tirBody ) return undefined;

        return [ new TirForStmt(
            tirInit,
            tirCond,
            tirUpdates,
            tirBody,
            stmt.range
        ) ];
    }
    private _compileForUpdateStmts(
        ctx: AstCompilationCtx,
        stmts: AssignmentStmt[]
    ): TirAssignmentStmt[] | undefined
    {
        const tirStmts: TirAssignmentStmt[] = [];
        for( let stmt of stmts )
        {
            const tirStmt = this._compileAssignmentStmt( ctx, stmt );
            // empty array here returns undefined
            // that is fine, because an empty array of assignments
            // is not a valid statement
            if( !tirStmt ) return undefined;
            tirStmts.push( ...tirStmt );
        }
        return tirStmts;
    }
    private _compileAssignmentStmt(
        ctx: AstCompilationCtx,
        stmt: AssignmentStmt
    ): [ TirAssignmentStmt ] | undefined
    {
        if(
            stmt instanceof IncrStmt
            || stmt instanceof DecrStmt
        )
        {
            const resolvedValue = ctx.scope.resolveValue( stmt.varIdentifier.text );
            if( !resolvedValue ) return this.error(
                DiagnosticCode._0_is_not_defined,
                stmt.varIdentifier.range, stmt.varIdentifier.text
            );
            const [ varSym, isDefinedOutsideFuncScope ] =  resolvedValue;
            const varType = varSym.type;
            if( !canAssignTo( varType, int_t ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.varIdentifier.range, varType.toString(), int_t.toString()
            );
            const varAccessExpr = new TirVariableAccessExpr(
                stmt.varIdentifier.text,
                varType,
                stmt.varIdentifier.range
            );
            return ([ new TirAssignmentStmt(
                varAccessExpr,
                stmt instanceof IncrStmt ?
                    new TirAddExpr(
                        varAccessExpr,
                        new TirLitIntExpr( BigInt( 1 ), stmt.range ),
                        stmt.range
                    ) :
                    new TirSubExpr(
                        varAccessExpr,
                        new TirLitIntExpr( BigInt( 1 ), stmt.range ),
                        stmt.range
                    ),
                stmt.range
            ) ]);
        }
        if( isExplicitAssignmentStmt( stmt ) )
        {
            const tirStmt = this._compileExplicitAssignmentStmt( ctx, stmt );
            if( !tirStmt ) return undefined;
            return [ tirStmt ];
        }
        else
        {
            console.error( stmt );
            throw new Error("unreachable::AstCompiler::_compileForUpdateStmts");
        }
    }
    private _compileExplicitAssignmentStmt(
        ctx: AstCompilationCtx,
        stmt: ExplicitAssignmentStmt
    ): TirAssignmentStmt | undefined
    {
        const scope = ctx.scope;
        const resovleResult = scope.resolveValue( stmt.varIdentifier.text );
        if( !resovleResult ) return this.error(
            DiagnosticCode._0_is_not_defined,
            stmt.range, stmt.varIdentifier.text
        );
        const [ varSym, isDefinedOutsideFuncScope ] = resovleResult;
        if( varSym.isConstant ) return this.error(
            DiagnosticCode.Cannot_assign_to_0_because_it_is_a_constant,
            stmt.varIdentifier.range, stmt.varIdentifier.text
        );
        const varType = varSym.type;
        
        const varAccessExpr = new TirVariableAccessExpr(
            stmt.varIdentifier.text,
            varType,
            stmt.varIdentifier.range
        );

        let expr: TirExpr | undefined = undefined;
        if( stmt instanceof SimpleAssignmentStmt )
        {
            expr = this._compileExpr( ctx, stmt.assignedExpr, varType );
            if( !expr ) return undefined;
            if( !canAssignTo( expr.type, varType ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.range, expr.type.toString(), varType.toString()
            );
        }
        else if( stmt instanceof AddAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirAddExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof SubAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirSubExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ExpAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirExponentiationExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof MultAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirMultExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof DivAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirDivExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ModuloAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirModuloExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ShiftLeftAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirShiftLeftExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ShiftRightAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirShiftRightExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof BitwiseAndAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirBitwiseAndExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof BitwiseXorAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirBitwiseXorExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof BitwiseOrAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirBitwiseOrExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof LogicalAndAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bool_t );
            if( !expr ) return undefined;
            expr = new TirLogicalAndExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof LogicalOrAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( ctx, stmt, varType, bool_t );
            if( !expr ) return undefined;
            expr = new TirLogicalOrExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else {
            console.error( stmt );
            throw new Error("unreachable::AstCompiler::_compileExplicitAssignmentStmt");
        }

        return new TirAssignmentStmt(
            varAccessExpr,
            expr,
            stmt.range
        );
    }
    private __getBinOpAssignmentLeftArg(
        ctx: AstCompilationCtx,
        stmt: ExplicitAssignmentStmt,
        varType: TirType,
        exprType: TirType
    ): TirExpr | undefined
    {
        if( !canAssignTo( varType, exprType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.varIdentifier.range, varType.toString(), exprType.toString()
        );
        const expr = this._compileExpr( ctx, stmt.assignedExpr, exprType );
        if( !expr ) return undefined;
        if( !canAssignTo( expr.type, exprType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.range, expr.type.toString(), exprType.toString()
        );
        return expr;
    }

    private _compileVarStmt(
        ctx: AstCompilationCtx,
        stmt: VarStmt,
        isTopLevel: boolean
    ): TirVarDecl[] | undefined
    {
        const tirVarDecls: TirVarDecl[] = [];
        for( const decl of stmt.declarations )
        {
            const tirDecl = this._compileVarDecl( ctx, decl, undefined, isTopLevel );
            if( !tirDecl ) return undefined;
            tirVarDecls.push( tirDecl );
        }
        return tirVarDecls;
    }
    private _compileVarDecl(
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
        ) return this.error(
            DiagnosticCode.Only_constants_can_be_declared_outside_of_a_function,
            decl.range
        );
        if( decl instanceof SimpleVarDecl )
            return this._compileSimpleVarDecl( ctx, decl, typeHint );
        if( decl instanceof NamedDeconstructVarDecl )
            return this._compileNamedDeconstructVarDecl( ctx, decl, typeHint );
        if( decl instanceof SingleDeconstructVarDecl )
            return this._compileSingleDeconstructVarDecl( ctx, decl, typeHint );
        if( decl instanceof ArrayLikeDeconstr )
            return this._compileArrayLikeDeconstr( ctx, decl, typeHint );

        console.error( decl );
        throw new Error("unreachable::AstCompiler::_compileVarDecl");
    }
    private _compileSimpleVarDecl(
        ctx: AstCompilationCtx,
        decl: SimpleVarDecl,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirVarDecl | undefined
    {
        const typeAndExpr = this._getVarDeclTypeAndExpr( ctx, decl, typeHint );
        if( !typeAndExpr ) return undefined;
        const [ finalVarType, initExpr ] = typeAndExpr;

        const success = ctx.scope.defineValue({
            name: decl.name.text,
            type: finalVarType,
            isConstant: decl.isConst()
        });
        if( !success )
        return this.error(
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
    private _compileNamedDeconstructVarDecl(
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

        const typeAndExpr = this._getVarDeclTypeAndExpr( ctx, decl, typeHint );
        if( !typeAndExpr ) return undefined;
        const [ finalVarType, initExpr ] = typeAndExpr;

        const namedDestructableType = getNamedDestructableType( finalVarType )
        if(
            !namedDestructableType
            || !namedDestructableType.isConcrete()
        )
        return this.error(
            DiagnosticCode.Invaild_destructuring,
            decl.range
        );

        if( namedDestructableType instanceof TirStructType )
        {
            const finalConstructorDef = namedDestructableType.constructors.find( ctor =>
                ctor.name === decl.name.text
            );
            if( !finalConstructorDef )
            return this.error(
                DiagnosticCode.Construcotr_0_is_not_part_of_the_definiton_of_1,
                decl.name.range, decl.name.text, namedDestructableType.toString()
            );
    
            const deconstructedFields = this._getDeconstructedFields(
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
            return this.error(
                DiagnosticCode.Construcotr_0_is_not_part_of_the_definiton_of_1,
                decl.name.range, decl.name.text, namedDestructableType.toString()
            );

            const deconstructedFields = this._getDeconstructedFields(
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
    private _compileSingleDeconstructVarDecl(
        ctx: AstCompilationCtx,
        decl: SingleDeconstructVarDecl,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirVarDecl | undefined
    {
        const typeAndExpr = this._getVarDeclTypeAndExpr( ctx, decl, typeHint  );
        if( !typeAndExpr ) return undefined;
        const [ finalVarType, initExpr ] = typeAndExpr;

        const finalStructType = getStructType( finalVarType );
        if( !finalStructType )
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                decl.range, finalVarType.toString(), "Struct"
            );
        if( finalStructType.constructors.length !== 1 )
            return this.error(
                DiagnosticCode.Deconstructing_0_requires_the_name_of_the_constructor,
                decl.range, finalVarType.toString()
            );

        const deconstructedFields = this._getDeconstructedFields(
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
    private _compileArrayLikeDeconstr(
        ctx: AstCompilationCtx,
        decl: ArrayLikeDeconstr,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirArrayLikeDeconstr | undefined
    {
        const typeAndExpr = this._getVarDeclTypeAndExpr( ctx, decl, typeHint );
        if( !typeAndExpr ) return undefined;
        const [ finalVarType, initExpr ] = typeAndExpr;

        const elemsType = getListTypeArg( finalVarType );
        if( !elemsType ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            decl.range, finalVarType.toString(), "List"
        );

        const elements: TirVarDecl[] = [];
        for( const declElem of decl.elements )
        {
            const compiled = this._compileVarDecl(
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
            if( !success ) return this.error(
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
    private _getDeconstructedFields(
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
                return this.error(
                    DiagnosticCode.Field_0_is_not_part_of_the_1_constructor_for_2_struct,
                    fieldIdentifier.range, fieldName, ctorDef.name
                );
            if( ctorNamesAlreadySpecified.includes( fieldName ) )
                return this.error(
                    DiagnosticCode.Duplicate_identifier_0,
                    fieldIdentifier.range, fieldName
                );
            ctorNamesAlreadySpecified.push( fieldName );

            // adds to scope "simple" var decls
            const tirVarDecl = this._compileVarDecl(
                ctx,
                varDecl,
                ctorDef.fields.find( f => f.name === fieldName )!.type,
            );
            if( !tirVarDecl ) return undefined;

            tirFields.set( fieldName, tirVarDecl );
        }
        if( astDeconstruct.rest && ctorDefFieldNames.length === ctorNamesAlreadySpecified.length )
            return this.error(
                DiagnosticCode.Invalid_rest_parameter_there_are_no_more_fields,
                astDeconstruct.rest.range
            );

        let rest: string | undefined = astDeconstruct.rest ? astDeconstruct.rest.text : undefined;
        return [ tirFields, rest ];
    }
    private _getVarDeclTypeAndExpr(
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
        const declarationType = decl.type ? this._compileConcreteTypeExpr( ctx, decl.type ) : undefined;
        // const typeHint = (
        //     declarationType ??
        //     undefined
        //     // this._tryInferVarTypeByUsage(
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
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    decl.type!.range, declarationType.toString(), typeHint!.toString()
                );
            }
            else if( !canAssignTo( declarationType, typeHint! ) )
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                decl.type!.range, declarationType.toString(), typeHint!.toString()
            );
        }

        let initExpr: TirExpr | undefined = undefined;
        if( decl.initExpr )
        {
            initExpr = this._compileExpr( ctx, decl.initExpr, typeHint );
            if( !initExpr ) return undefined;
            if( typeHint && !canAssignTo( initExpr.type, typeHint ) )
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    decl.initExpr.range, initExpr.type.toString(), typeHint.toString()
                );
        }

        const finalVarType = typeHint ?? initExpr?.type;

        if( !finalVarType )
        return this.error(
            DiagnosticCode.Cannot_infer_variable_type_Try_to_make_the_type_explicit,
            decl.range
        );

        return [ finalVarType, initExpr ];
    }

    private _compileConcreteTypeExpr(
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
            const compiledArg = this._compileConcreteTypeExpr( ctx, typeExpr.typeArg );
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
            const compiledArg = this._compileConcreteTypeExpr( ctx, typeExpr.typeArg );
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
            const kArg = this._compileConcreteTypeExpr( ctx, typeExpr.keyTypeArg );
            if( !kArg || !kArg.isConcrete() ) return undefined;

            const vArg = this._compileConcreteTypeExpr( ctx, typeExpr.valTypeArg );
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
            if( !typeExpr.returnType ) return this.error(
                DiagnosticCode.Type_expected,
                typeExpr.range.atEnd()
            );

            const argTypes = typeExpr.params.map( argTypeExpr =>
                this._compileConcreteTypeExpr( ctx, argTypeExpr )
            );
            if( argTypes.some( argType => !argType || !argType.isConcrete() ) ) return undefined;

            const retType = this._compileConcreteTypeExpr( ctx, typeExpr.returnType );
            if( !retType || !retType.isConcrete() ) return undefined;

            // there is no need to generate symbols on (anonymous) function types
            return new TirFuncT( argTypes as TirType[], retType );
        }
        if( typeExpr instanceof AstNamedTypeExpr ) // struct, aliases and respective params
        {
            const typeDefSym = ctx.scope.resolveType( typeExpr.name.text );
            if( !typeDefSym ) return this.error(
                DiagnosticCode._0_is_not_defined,
                typeExpr.name.range, typeExpr.name.text
            );

            const typeExprArgs = typeExpr.tyArgs.map( typeArgExpr =>
                this._compileConcreteTypeExpr( ctx, typeArgExpr )
            ) as TirType[];
            if( typeExprArgs.some( typeArg =>
                !typeArg
                || !typeArg.isConcrete()
            )) return undefined;

            if( typeDefSym instanceof PebbleConcreteTypeSym )
            {
                if( typeExprArgs.length > 0 )
                return this.error(
                    DiagnosticCode.Type_0_is_not_generic,
                    typeExpr.name.range, typeDefSym.concreteType.toString()
                );
                return typeDefSym.concreteType;
            }
            if( typeDefSym instanceof PebbleGenericSym )
            {
                const nTypeDefArgs = typeDefSym.nTypeParameters
                if( typeExprArgs.length !== nTypeDefArgs )
                return this.error(
                    DiagnosticCode.Expected_0_type_arguments_but_got_1,
                    typeExpr.range, nTypeDefArgs.toString(), typeExprArgs.length.toString()
                );
                const inferredType = typeDefSym.getConcreteType( ...typeExprArgs );
                if( !inferredType ) return this.error(
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
    
    private _compileIfStmt(
        ctx: AstCompilationCtx,
        stmt: IfStmt
    ): [ TirIfStmt ] | undefined
    {
        const coditionExpr = this._compileExpr( ctx, stmt.condition, bool_t );
        if( !coditionExpr ) return undefined;
        if(
            !canAssignTo( coditionExpr.type, bool_t )
            && !canAssignTo( coditionExpr.type, any_optional_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.condition.range, coditionExpr.type.toString(), "boolean | Optional<T>"
        );
        const thenBranch = wrapManyStatements(
            _compileStatement(
                ctx.newBranchChildScope(),
                stmt.thenBranch
            ),
            stmt.thenBranch.range
        );
        if( !thenBranch ) return undefined;

        let elseBranch: TirStmt | undefined = undefined;
        if( stmt.elseBranch )
        {
            elseBranch = wrapManyStatements(
                _compileStatement(
                    ctx.newBranchChildScope(),
                    stmt.elseBranch
                ),
                stmt.elseBranch.range
            );
            if( !elseBranch ) return undefined;
        }

        return [
            new TirIfStmt(
                coditionExpr,
                thenBranch,
                elseBranch,
                stmt.range
            )
        ];
    }

    /**
     * here we just translate to TIR
     * 
     * WE DO NOT OPTIMIZE
     * 
     * optimizaitons are part of the TIR -> TermIR compilation
    **/
    private _compileExpr(
        ctx: AstCompilationCtx,
        expr: PebbleExpr,
        /**
         * this is just a type **hint**
         * it is only used as last resource to
         * disambiguate the type of an expression.
         * 
         * it is **NOT guaranteed** that the returned expression will be assignable to this type
         * 
         * if that is the case, it needs to be checked OUTSIDE this function
        **/
        typeHint: TirType | undefined
    ): TirExpr | undefined
    {
        if( expr instanceof Identifier ) return this._compileVarAccessExpr( ctx, expr, typeHint );
        if( isUnaryPrefixExpr( expr ) ) return this._compileUnaryPrefixExpr( ctx, expr, typeHint );
        if( expr instanceof NonNullExpr ) return this._compileNonNullExpr( ctx, expr, typeHint );
        if( expr instanceof ParentesizedExpr ) return this._compileExpr( ctx, expr.expr, typeHint );
        if( expr instanceof FuncExpr ) return this._compileFuncExpr( ctx, expr, typeHint );
        if( expr instanceof CallExpr ) return this._compileCallExpr( ctx, expr, typeHint );
        if( expr instanceof CaseExpr ) return this._compileCaseExpr( ctx, expr, typeHint );
        if( expr instanceof TypeConversionExpr ) return this._compileTypeConversionExpr( ctx, expr, typeHint );
        if( expr instanceof NonNullExpr ) return this._compileNonNullExpr( ctx, expr, typeHint );
        if( expr instanceof IsExpr ) return this._compileIsExpr( ctx, expr, typeHint );
        if( expr instanceof ElemAccessExpr ) return this._compileElemAccessExpr( ctx, expr, typeHint );
        if( expr instanceof TernaryExpr ) return this._compileTernaryExpr( ctx, expr, typeHint );
        if( isPropAccessExpr( expr ) ) return this._compilePropAccessExpr( ctx, expr, typeHint );
        if( isBinaryExpr( expr ) ) return this._compileBinaryExpr( ctx, expr, typeHint );
        //*/

        if( isLitteralExpr( expr ) ) return this._compileLitteralExpr( ctx, expr, typeHint );

        console.error( expr );
        throw new Error("unreachable::AstCompiler::_compileExpr");
    }

    private _compileBinaryExpr(
        ctx: AstCompilationCtx,
        expr: BinaryExpr,
        typeHint: TirType | undefined
    ): TirBinaryExpr | undefined
    {
        if( expr instanceof ExponentiationExpr ) return this._compileExponentiationExpr( ctx, expr, typeHint );
        if( expr instanceof LessThanExpr ) return this._compileLessThanExpr( ctx, expr, typeHint );
        if( expr instanceof GreaterThanExpr ) return this._compileGreaterThanExpr( ctx, expr, typeHint );
        if( expr instanceof LessThanEqualExpr ) return this._compileLessThanEqualExpr( ctx, expr, typeHint );
        if( expr instanceof GreaterThanEqualExpr ) return this._compileGreaterThanEqualExpr( ctx, expr, typeHint );
        if( expr instanceof EqualExpr ) return this._compileEqualExpr( ctx, expr, typeHint );
        if( expr instanceof NotEqualExpr ) return this._compileNotEqualExpr( ctx, expr, typeHint );
        if( expr instanceof AddExpr ) return this._compileAddExpr( ctx, expr, typeHint );
        if( expr instanceof SubExpr ) return this._compileSubExpr( ctx, expr, typeHint );
        if( expr instanceof MultExpr ) return this._compileMultExpr( ctx, expr, typeHint );
        if( expr instanceof DivExpr ) return this._compileDivExpr( ctx, expr, typeHint );
        if( expr instanceof ModuloExpr ) return this._compileModuloExpr( ctx, expr, typeHint );
        if( expr instanceof ShiftLeftExpr ) return this._compileShiftLeftExpr( ctx, expr, typeHint );
        if( expr instanceof ShiftRightExpr ) return this._compileShiftRightExpr( ctx, expr, typeHint );
        if( expr instanceof BitwiseAndExpr ) return this._compileBitwiseAndExpr( ctx, expr, typeHint );
        if( expr instanceof BitwiseXorExpr ) return this._compileBitwiseXorExpr( ctx, expr, typeHint );
        if( expr instanceof BitwiseOrExpr ) return this._compileBitwiseOrExpr( ctx, expr, typeHint );
        if( expr instanceof LogicalAndExpr ) return this._compileLogicalAndExpr( ctx, expr, typeHint );
        if( expr instanceof LogicalOrExpr ) return this._compileLogicalOrExpr( ctx, expr, typeHint );
        if( expr instanceof OptionalDefaultExpr ) return this._compileOptionalDefaultExpr( ctx, expr, typeHint );

        console.error( expr );
        throw new Error("unreachable::AstCompiler::_compileBinaryExpr");
    }
    // WE ONLY NEED BINARY EXPR HERE
    // FROM LAST TO FIRST
    // THAT IS NOT YET IMPLEMENTED

    private _compileExponentiationExpr(
        ctx: AstCompilationCtx,
        expr: ExponentiationExpr,
        _typeHint: TirType | undefined
    ): TirExponentiationExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, int_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirExponentiationExpr(
            left,
            right,
            // implicit int type
            expr.range
        );
    }

    private _compileLessThanExpr(
        ctx: AstCompilationCtx,
        expr: LessThanExpr,
        typeHint: TirType | undefined
    ): TirLessThanExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint );
        if( !left ) return undefined;

        if(
            !canAssignTo( left.type, int_t )
            && !canAssignTo( left.type, bytes_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        let leftType = left.type;
        while( leftType instanceof TirAliasType ) leftType = leftType.aliased;

        const right = this._compileExpr( ctx, expr.right, leftType );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, leftType ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), leftType.toString()
        );

        return new TirLessThanExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        ); 
    }

    private _compileGreaterThanExpr(
        ctx: AstCompilationCtx,
        expr: GreaterThanExpr,
        typeHint: TirType | undefined
    ): TirGreaterThanExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint );
        if( !left ) return undefined;

        if(
            !canAssignTo( left.type, int_t )
            && !canAssignTo( left.type, bytes_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        let leftType = left.type;
        while( leftType instanceof TirAliasType ) leftType = leftType.aliased;

        const right = this._compileExpr( ctx, expr.right, leftType );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, leftType ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), leftType.toString()
        );

        return new TirGreaterThanExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        ); 
    }

    private _compileLessThanEqualExpr(
        ctx: AstCompilationCtx,
        expr: LessThanEqualExpr,
        typeHint: TirType | undefined
    ): TirLessThanEqualExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint );
        if( !left ) return undefined;

        if(
            !canAssignTo( left.type, int_t )
            && !canAssignTo( left.type, bytes_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        let leftType = left.type;
        while( leftType instanceof TirAliasType ) leftType = leftType.aliased;

        const right = this._compileExpr( ctx, expr.right, leftType );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, leftType ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), leftType.toString()
        );

        return new TirLessThanEqualExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        ); 
    }

    // only aviable for ints and bytes
    private _compileGreaterThanEqualExpr(
        ctx: AstCompilationCtx,
        expr: GreaterThanEqualExpr,
        typeHint: TirType | undefined
    ): TirGreaterThanEqualExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint );
        if( !left ) return undefined;

        if(
            !canAssignTo( left.type, int_t )
            && !canAssignTo( left.type, bytes_t )
        )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        let leftType = left.type;
        while( leftType instanceof TirAliasType ) leftType = leftType.aliased;

        const right = this._compileExpr( ctx, expr.right, leftType );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, leftType ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), leftType.toString()
        );

        return new TirGreaterThanEqualExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        );
    }

    private _compileEqualExpr(
        ctx: AstCompilationCtx,
        expr: EqualExpr,
        typeHint: TirType | undefined
    ): TirEqualExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint );
        if( !left ) return undefined;

        const leftType = left.type;

        const right = this._compileExpr( ctx, expr.right, leftType );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, leftType ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), leftType.toString()
        );

        return new TirEqualExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        );
    }

    private _compileNotEqualExpr(
        ctx: AstCompilationCtx,
        expr: NotEqualExpr,
        typeHint: TirType | undefined
    ): TirNotEqualExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint );
        if( !left ) return undefined;

        const leftType = left.type;

        const right = this._compileExpr( ctx, expr.right, leftType );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, leftType ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), leftType.toString()
        );

        return new TirNotEqualExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        );
    }

    private _compileAddExpr(
        ctx: AstCompilationCtx,
        expr: AddExpr,
        _typeHint: TirType | undefined
    ): TirAddExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, int_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirAddExpr(
            left,
            right,
            // implicit int type,
            expr.range
        );
    }

    private _compileSubExpr(
        ctx: AstCompilationCtx,
        expr: SubExpr,
        _typeHint: TirType | undefined
    ): TirSubExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, int_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirSubExpr(
            left,
            right,
            // implicit int type,
            expr.range
        );
    }

    private _compileMultExpr(
        ctx: AstCompilationCtx,
        expr: MultExpr,
        _typeHint: TirType | undefined
    ): TirMultExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, int_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirMultExpr(
            left,
            right,
            // implicit int type,
            expr.range
        );
    }

    private _compileDivExpr(
        ctx: AstCompilationCtx,
        expr: DivExpr,
        _typeHint: TirType | undefined
    ): TirDivExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, int_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirDivExpr(
            left,
            right,
            // implicit int type,
            expr.range
        );
    }

    private _compileModuloExpr(
        ctx: AstCompilationCtx,
        expr: ModuloExpr,
        _typeHint: TirType | undefined
    ): TirModuloExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, int_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), int_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirModuloExpr(
            left,
            right,
            // implicit int type,
            expr.range
        );
    }

    private _compileShiftLeftExpr(
        ctx: AstCompilationCtx,
        expr: ShiftLeftExpr,
        _typeHint: TirType | undefined
    ): TirShiftLeftExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bytes_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bytes_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirShiftLeftExpr(
            left,
            right,
            // implicit bytes type,
            expr.range
        );
    }

    private _compileShiftRightExpr(
        ctx: AstCompilationCtx,
        expr: ShiftRightExpr,
        _typeHint: TirType | undefined
    ): TirShiftRightExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bytes_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bytes_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, int_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, int_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), int_t.toString()
        );

        return new TirShiftRightExpr(
            left,
            right,
            // implicit bytes type,
            expr.range
        );
    }

    private _compileBitwiseAndExpr(
        ctx: AstCompilationCtx,
        expr: BitwiseAndExpr,
        _typeHint: TirType | undefined
    ): TirBitwiseAndExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bytes_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bytes_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, bytes_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), bytes_t.toString()
        );

        return new TirBitwiseAndExpr(
            left,
            right,
            // implicit bytes type,
            expr.range
        );
    }

    private _compileBitwiseXorExpr(
        ctx: AstCompilationCtx,
        expr: BitwiseXorExpr,
        _typeHint: TirType | undefined
    ): TirBitwiseXorExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bytes_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bytes_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, bytes_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), bytes_t.toString()
        );

        return new TirBitwiseXorExpr(
            left,
            right,
            // implicit bytes type,
            expr.range
        );
    }

    private _compileBitwiseOrExpr(
        ctx: AstCompilationCtx,
        expr: BitwiseOrExpr,
        _typeHint: TirType | undefined
    ): TirBitwiseOrExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bytes_t );
        if( !left ) return undefined;

        if( !canAssignTo( left.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bytes_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, bytes_t );
        if( !right ) return undefined;

        if( !canAssignTo( right.type, bytes_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), bytes_t.toString()
        );

        return new TirBitwiseOrExpr(
            left,
            right,
            // implicit bytes type,
            expr.range
        );
    }

    private _compileLogicalAndExpr(
        ctx: AstCompilationCtx,
        expr: LogicalAndExpr,
        _typeHint: TirType | undefined
    ): TirLogicalAndExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bool_t );
        if( !left ) return undefined;

        // TODO: accept optionals
        if( !canAssignTo( left.type, bool_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bool_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, bool_t );
        if( !right ) return undefined;

        // TODO: accept optionals
        if( !canAssignTo( right.type, bool_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), bool_t.toString()
        );

        return new TirLogicalAndExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        );
    }

    private _compileLogicalOrExpr(
        ctx: AstCompilationCtx,
        expr: LogicalOrExpr,
        _typeHint: TirType | undefined
    ): TirLogicalOrExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, bool_t );
        if( !left ) return undefined;

        // TODO: accept optionals
        if( !canAssignTo( left.type, bool_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.left.range, left.type.toString(), bool_t.toString()
        );

        const right = this._compileExpr( ctx, expr.right, bool_t );
        if( !right ) return undefined;

        // TODO: accept optionals
        if( !canAssignTo( right.type, bool_t ) )
        return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), bool_t.toString()
        );

        return new TirLogicalOrExpr(
            left,
            right,
            // implicit bool type,
            expr.range
        );
    }

    private _compileOptionalDefaultExpr(
        ctx: AstCompilationCtx,
        expr: OptionalDefaultExpr,
        typeHint: TirType | undefined
    ): TirOptionalDefaultExpr | undefined
    {
        const left = this._compileExpr( ctx, expr.left, typeHint ? new TirOptT( typeHint ) : undefined );
        if( !left ) return undefined;

        const leftType = left.type;
        const leftOptArg = getOptTypeArg( leftType );
        const returnType = leftOptArg ?? leftType;
        const optReturnType = new TirOptT( returnType );

        if( !leftOptArg ) return this.warning(
            DiagnosticCode.Left_side_of_opeartor_is_not_optional_right_side_is_unused,
            expr.right.range
        );

        const right = this._compileExpr( ctx, expr.right, leftOptArg ?? typeHint );
        if( !right ) return undefined;

        const isUnwrappedReturn = canAssignTo( right.type, returnType );
        if( !isUnwrappedReturn && !canAssignTo( right.type, optReturnType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.right.range, right.type.toString(), returnType.toString()
        );

        return new TirOptionalDefaultExpr(
            left,
            right,
            isUnwrappedReturn ? returnType : optReturnType,
            expr.range
        );
    }

    private _compileVarAccessExpr(
        ctx: AstCompilationCtx,
        expr: Identifier,
        typeHint: TirType | undefined
    ): TirVariableAccessExpr | undefined
    {
        const resolvedValue = ctx.scope.resolveValue( expr.text );
        if( !resolvedValue ) return this.error(
            DiagnosticCode._0_is_not_defined,
            expr.range, expr.text
        );
        const [ varSym, isDefinedOutsideFuncScope ] = resolvedValue;
        return new TirVariableAccessExpr(
            expr.text,
            varSym.type,
            expr.range
        );
    }

    private _compilePropAccessExpr(
        ctx: AstCompilationCtx,
        expr: PropAccessExpr,
        typeHint: TirType | undefined
    ): TirPropAccessExpr | undefined
    {
        if( expr instanceof OptionalPropAccessExpr ) return this._compileOptionalPropAccessExpr( ctx, expr, typeHint );
        if( expr instanceof NonNullPropAccessExpr ) return this._compileNonNullPropAccessExpr( ctx, expr, typeHint );
        if( expr instanceof DotPropAccessExpr ) return this._compileDotPropAccessExpr( ctx, expr, typeHint );

        console.error( expr );
        throw new Error("unreachable::AstCompiler::_compilePropAccessExpr");
    }

    private _compileOptionalPropAccessExpr(
        ctx: AstCompilationCtx,
        expr: OptionalPropAccessExpr,
        _typeHint: TirType | undefined
    ): TirOptionalPropAccessExpr | undefined
    {
        const objExpr = this._compileExpr( ctx, expr.object, undefined );
        if( !objExpr ) return undefined;

        const objType = objExpr.type;
        const returnType = getPropAccessReturnType( objType, expr.prop );
        if( !returnType ) return this.error(
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

    private _compileNonNullPropAccessExpr(
        ctx: AstCompilationCtx,
        expr: NonNullPropAccessExpr,
        _typeHint: TirType | undefined
    ): TirDotPropAccessExpr | undefined
    {
        const nonNullObj = this._compileNonNullExpr(
            ctx,
            new NonNullExpr( expr.object, expr.object.range ),
            undefined
        );
        if( !nonNullObj ) return undefined;
        return this._compileDotPropAccessExpr(
            ctx,
            new DotPropAccessExpr( nonNullObj, expr.prop, expr.range ),
            _typeHint
        );
    }

    private _compileDotPropAccessExpr(
        ctx: AstCompilationCtx,
        expr: DotPropAccessExpr,
        _typeHint: TirType | undefined
    ): TirDotPropAccessExpr | undefined
    {
        const objExpr = this._compileExpr( ctx, expr.object, undefined );
        if( !objExpr ) return undefined;

        const objType = objExpr.type;
        const returnType = getPropAccessReturnType( objType, expr.prop );
        if( !returnType ) return this.error(
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

    private _compileTernaryExpr(
        ctx: AstCompilationCtx,
        expr: TernaryExpr,
        typeHint: TirType | undefined
    ): TirTernaryExpr | undefined
    {
        const cond = this._compileExpr( ctx, expr.condition, bool_t );
        if( !cond ) return undefined;
        if( !canAssignTo( cond.type, bool_t ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.condition.range, cond.type.toString(), bool_t.toString()
        );

        const thenExpr = this._compileExpr( ctx, expr.ifTrue, typeHint );
        if( !thenExpr ) return undefined;

        const returnType = thenExpr.type;

        const elseExpr = this._compileExpr( ctx, expr.ifFalse, returnType );
        if( !elseExpr ) return undefined;

        if( !canAssignTo( elseExpr.type, returnType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.ifFalse.range, elseExpr.type.toString(), returnType.toString()
        );

        return new TirTernaryExpr(
            cond,
            thenExpr,
            elseExpr,
            returnType,
            expr.range
        );
    }

    private _compileElemAccessExpr(
        ctx: AstCompilationCtx,
        expr: ElemAccessExpr,
        typeHint: TirType | undefined
    ): TirElemAccessExpr | undefined
    {
        const litsTypeHint = typeHint ? new TirListT( typeHint ) : undefined;

        const arrLikeExpr = this._compileExpr( ctx, expr.arrLikeExpr, litsTypeHint );
        if( !arrLikeExpr ) return undefined;
        
        const arrLikeType = arrLikeExpr.type;
        const elemsType = getListTypeArg( arrLikeType );
        if( !elemsType ) return this.error(
            DiagnosticCode.This_expression_cannot_be_indexed,
            expr.arrLikeExpr.range
        );

        const indexExpr = this._compileExpr( ctx, expr.indexExpr, int_t );
        if( !indexExpr ) return undefined;
        if( !canAssignTo( indexExpr.type, int_t ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            expr.indexExpr.range, indexExpr.type.toString(), int_t.toString()
        );

        return new TirElemAccessExpr(
            arrLikeExpr,
            indexExpr,
            elemsType,
            expr.range
        );
    }

    private _compileIsExpr(
        ctx: AstCompilationCtx,
        expr: IsExpr,
        _typeHint: TirType | undefined
    ): TirIsExpr | undefined
    {
        const target = this._compileExpr( ctx, expr.instanceExpr, undefined );
        if( !target ) return undefined;

        const structType = getStructType( target.type );
        if( !structType ) return this.error(
            DiagnosticCode.Cannot_use_is_operator_on_a_value_that_is_not_a_struct_type,
            expr.instanceExpr.range
        );

        const targetCtorId = expr.ofType;
        const targetCtorName = targetCtorId.text;

        const structCtors = structType.constructors;
        const targetCtor = structCtors.find( ctor => ctor.name === targetCtorName );
        if( !targetCtor ) return this.error(
            DiagnosticCode.Constructor_0_is_not_part_of_the_definition_of_1,
            expr.ofType.range, targetCtorName, structType.toString()
        );

        if( structCtors.length === 1 )
        this.warning(
            DiagnosticCode.This_check_is_redundant_Struct_0_has_only_one_possible_constructor,
            expr.range, structType.toString()
        );

        return new TirIsExpr(
            target,
            expr.ofType,
            bool_t,
            expr.range
        );
    }

    private _compileNonNullExpr(
        ctx: AstCompilationCtx,
        expr: NonNullExpr,
        typeHint: TirType | undefined
    ): TirNonNullExpr | undefined
    {
        const operand = this._compileExpr( ctx, expr.operand, typeHint );
        if( !operand ) return undefined;
        const operandType = operand.type;
        const nonNullType = getOptTypeArg( operandType );
        if( !nonNullType ) this.warning(
            DiagnosticCode.Non_null_opeartor_used_on_expression_of_type_0_which_is_not_optional_this_will_be_omitted_during_compilation,
            expr.operand.range, operandType.toString()
        );
        return new TirNonNullExpr(
            operand,
            nonNullType ?? operandType,
            expr.range
        );
    }

    private _compileTypeConversionExpr(
        ctx: AstCompilationCtx,
        ast: TypeConversionExpr,
        typeHint: TirType | undefined
    ): TirTypeConversionExpr | undefined
    {
        const targetType = this._compileConcreteTypeExpr( ctx, ast.asType );
        if( !targetType ) return undefined;

        const expr = this._compileExpr( ctx, ast.expr, targetType );
        if( !expr ) return undefined;

        if( !canCastTo( expr.type, targetType ) ) return this.error(
            DiagnosticCode.Type_0_cannot_be_converted_to_type_1,
            ast.expr.range, expr.type.toString(), targetType.toString()
        );

        return new TirTypeConversionExpr(
            expr,
            targetType,
            ast.range
        );
    }

    private _compileCaseExpr(
        ctx: AstCompilationCtx,
        expr: CaseExpr,
        typeHint: TirType | undefined
    ): TirCaseExpr | undefined
    {
        const matchExpr = this._compileExpr( ctx, expr.matchExpr, typeHint );
        if( !matchExpr ) return undefined;

        const cases = expr.cases.map( branch =>
            this._compileCaseExprMatcher(
                ctx,
                branch,
                matchExpr.type,
                typeHint
            )
        ) as TirCaseExprMatcher[]; // we early return in case of undefined so this is safe
        if( cases.some( c => !c ) ) return undefined;

        const returnType = cases[0]?.body.type ?? typeHint;
        if( !returnType ) return this.error(
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

    private _compileCaseExprMatcher(
        ctx: AstCompilationCtx,
        matcher: CaseExprMatcher,
        patternType: TirType,
        returnTypeHint: TirType | undefined
    ): TirCaseExprMatcher | undefined
    {
        const pattern = this._compileVarDecl( ctx, matcher.pattern, patternType );
        if( !pattern ) return undefined;
        if( !canAssignTo( pattern.type, patternType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            matcher.pattern.range, pattern.type.toString(), patternType.toString()
        );

        const body = this._compileExpr( ctx, matcher.body, returnTypeHint );
        if( !body ) return undefined;
        if( returnTypeHint && !canAssignTo( body.type, returnTypeHint ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            matcher.body.range, body.type.toString(), returnTypeHint.toString()
        );

        return new TirCaseExprMatcher(
            pattern,
            body,
            matcher.range
        );
    }
    
    private _compileCallExpr(
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

        const funcExpr = this._compileExpr( ctx, expr.funcExpr, typeHint );
        if( !funcExpr ) return undefined;

        if( !( funcExpr.type instanceof TirFuncT ) ) return this.error(
            DiagnosticCode.Expression_is_not_callable,
            expr.funcExpr.range
        );
        const funcType = funcExpr.type;

        for( let i = funcType.argTypes.length; i < expr.args.length; i++ )
        {
            this.warning(
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
            this._compileExpr( ctx, arg, funcType.argTypes[i] )
        ) as TirExpr[]; // we early return in case of undefined
        for( let i = 0; i < args.length; i++ )
        {
            const arg = args[i];
            if( !arg ) return undefined;
            if( !canAssignTo( arg.type, funcType.argTypes[i] ) )
            return this.error(
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

    private _compileUnaryPrefixExpr(
        ctx: AstCompilationCtx,
        expr: UnaryPrefixExpr,
        _typeHint: TirType | undefined
    ): TirUnaryPrefixExpr | undefined
    {
        if( expr instanceof UnaryExclamation )
        {
            const operand = this._compileExpr( ctx, expr.operand, bool_t );
            if( !operand ) return undefined;
            const operandType = operand.type;
            if(!(
                canAssignTo( operandType, bool_t )
                || canAssignTo( operandType, any_optional_t )
            )) {
                return this.error(
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
            const operand = this._compileExpr( ctx, expr.operand, int_t );
            if( !operand ) return undefined;
            const operandType = operand.type;
            if( !canAssignTo( operandType, int_t ) ) {
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    expr.operand.range, operand.type.toString(), "int"
                );
            }
            if( expr instanceof UnaryPlus ) return new TirUnaryPlus( operand, int_t, expr.range );
            if( expr instanceof UnaryMinus ) return new TirUnaryMinus( operand, int_t, expr.range );
        }
        else if( expr instanceof UnaryTilde )
        {
            const operand = this._compileExpr( ctx, expr.operand, bytes_t );
            if( !operand ) return undefined;
            const operandType = operand.type;
            if( !canAssignTo( operandType, bytes_t ) ) {
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    expr.operand.range, operand.type.toString(), "bytes"
                );
            }
            return new TirUnaryTilde( operand, int_t, expr.range );
        }

        console.error( expr );
        throw new Error("unreachable::AstCompiler::_compileUnaryPrefixExpr");
    }

    private _compileLitteralExpr(
        ctx: AstCompilationCtx,
        expr: LitteralExpr,
        typeHint: TirType | undefined
    ): TirExpr | undefined
    {
        if( expr instanceof LitVoidExpr ) return new TirLitVoidExpr( expr.range );
        if( expr instanceof LitUndefExpr ) return this._compileLitteralUndefExpr( expr, typeHint );
        if( expr instanceof LitTrueExpr ) return new TirLitTrueExpr( expr.range );
        if( expr instanceof LitFalseExpr ) return new TirLitFalseExpr( expr.range );
        if( expr instanceof LitStrExpr ) return new TirLitStrExpr( expr.string, expr.range );
        if( expr instanceof LitIntExpr ) return new TirLitIntExpr( expr.integer, expr.range );
        if( expr instanceof LitHexBytesExpr ) return new TirLitHexBytesExpr( expr.bytes, expr.range );
        if( expr instanceof LitThisExpr )
        {
            const this_t = ctx.scope.getThisType();
            if( !this_t ) return this.error(
                DiagnosticCode._this_cannot_be_referenced_in_current_location,
                expr.range
            );
            return new TirLitThisExpr(
                this_t,
                expr.range
            );
        }
        if( expr instanceof LitArrExpr ) return this._compileLitteralArrayExpr( ctx, expr, typeHint );
        if( expr instanceof LitObjExpr ) return this._compileLitteralObjExpr( ctx, expr, typeHint );
        if( expr instanceof LitNamedObjExpr ) return this._compileLitteralNamedObjExpr( ctx, expr, typeHint );

        // never
        // expr;
        throw new Error("unreachable::AstCompiler::_compileLitteralExpr");
    }

    private _compileLitteralUndefExpr(
        expr: LitUndefExpr,
        typeHint: TirType | undefined
    ): TirLitUndefExpr | undefined
    {
        if( !isTirType( typeHint ) )
        {
            return this.error(
                DiagnosticCode.Litteral_value_undefined_must_be_explicitly_cast_to_an_Optional_type,
                expr.range
            );
        }
        if( !canAssignTo( typeHint, any_optional_t ) )
        {
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                expr.range, "Optional<T>", typeHint.toString()
            );
        }
        return new  TirLitUndefExpr(
            typeHint,
            expr.range
        );
    }

    private _compileLitteralNamedObjExpr(
        ctx: AstCompilationCtx,
        expr: LitNamedObjExpr,
        typeHint: TirType | undefined
    ): TirLitNamedObjExpr | undefined
    {
        let structType: TirStructType | undefined = undefined;
        if( isTirType( typeHint ) )
        {
            if( !isStructOrStructAlias( typeHint ) )
            {
                return this.error(
                    DiagnosticCode.Named_object_litteral_is_not_assignable_to_0,
                    expr.range, typeHint.toString()
                );
            }
            structType = getStructType( typeHint );
        } else typeHint = undefined;
        const constructorName = expr.name.text;
        const inferredStructType: TirStructType | undefined = getStructType(
            ctx.scope.inferStructTypeFromConstructorName( constructorName )?.structType
        );
        if( !inferredStructType )
        {
            return this.error(
                DiagnosticCode._0_is_not_defined,
                expr.name.range, constructorName
            );
        }
        if( typeHint )
        {
            if( !canAssignTo( inferredStructType, typeHint ) )
            {
                return this.error(
                    DiagnosticCode.Named_object_litteral_is_not_assignable_to_0,
                    expr.range, typeHint.toString()
                );
            }
        }

        structType = inferredStructType;
        if( !isTirType( typeHint ) ) typeHint = structType ?? inferredStructType;

        const fieldValues = this.__commonCompileStructFieldValues(
            ctx,
            expr,
            typeHint,
            structType,
            structType?.constructors.findIndex( c => c.name === constructorName ) ?? -1
        );
        if( !Array.isArray( fieldValues ) ) return undefined;

        return new TirLitNamedObjExpr(
            expr.name,
            expr.fieldNames,
            fieldValues,
            typeHint!,
            expr.range
        );
    }

    private _compileLitteralObjExpr(
        ctx: AstCompilationCtx,
        expr: LitObjExpr,
        typeHint: TirType | undefined
    ): TirLitObjExpr | undefined
    {
        if( !isTirType( typeHint ) )
        {
            return this.error(
                DiagnosticCode.Unnamed_object_litteral_must_be_explicitly_cast_to_a_type,
                expr.range
            );
        }
        if( !isStructOrStructAlias( typeHint ) )
        {
            return this.error(
                DiagnosticCode.Unnamed_object_litteral_is_not_assignable_to_0,
                expr.range, typeHint.toString()
            );
        }
        const structType = getStructType( typeHint )!;
        if( structType.constructors.length !== 1 )
        {
            return this.error(
                DiagnosticCode.Unnamed_object_litteral_is_not_assignable_to_0_An_explicit_constrctor_must_be_used,
                expr.range, typeHint.toString()
            );
        }
        const fieldValues = this.__commonCompileStructFieldValues(
            ctx,
            expr,
            typeHint,
            structType,
            0
        );
        if( !Array.isArray( fieldValues ) ) return undefined; 
        return new TirLitObjExpr(
            expr.fieldNames,
            fieldValues,
            typeHint,
            expr.range
        );
    }

    private __commonCompileStructFieldValues(
        ctx: AstCompilationCtx,
        expr: LitObjExpr | LitNamedObjExpr,
        realType: TirType, // possibly aliased
        structType: TirStructType,
        constructorIndex: number
    ): TirExpr[] | undefined
    {
        if( constructorIndex < 0 || constructorIndex >= structType.constructors.length )
            throw new Error("unreachable::__commonCompileStructFieldValues");

        const constructorDef = structType.constructors[constructorIndex];
        for( const exprField of expr.fieldNames )
        {
            if( !constructorDef.fields.some( realField => realField.name === exprField.text ) )
            {
                return this.error(
                    DiagnosticCode.Field_0_is_not_part_of_the_1_constructor_for_2_struct,
                    exprField.range, exprField.text, constructorDef.name, structType
                );
            }
        }
        if( expr.fieldNames.length !== constructorDef.fields.length )
        {
            return this.error(
                DiagnosticCode.Unnamed_object_litteral_is_not_assignable_to_0_The_fields_do_not_match_the_the_type_definition,
                expr.range, realType.toString()
            );
        }
        const fieldValues: TirExpr[] = new Array( constructorDef.fields.length );
        for( let i = 0; i < constructorDef.fields.length; i++ )
        {
            const fieldDef = constructorDef.fields[i];
            const initAstExprIdx = expr.fieldNames.findIndex( name => name.text === fieldDef.name );
            if( initAstExprIdx === -1 )
            {
                return this.error(
                    DiagnosticCode.Field_0_is_missing_but_required_by_the_1_constructor_of_the_2_struct,
                    expr.range, fieldDef.name, constructorDef.name, structType
                );
            }
            const initExpr = this._compileExpr( ctx, expr.values[initAstExprIdx], fieldDef.type );
            if( !initExpr ) return undefined;
            if( !canAssignTo( initExpr.type, fieldDef.type ) )
            {
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    expr.values[initAstExprIdx].range, initExpr.type, fieldDef.type
                );
            }
            fieldValues[i] = initExpr;
        }
        return fieldValues;
    }

    private _compileLitteralArrayExpr(
        ctx: AstCompilationCtx,
        expr: LitArrExpr,
        typeHint: TirType | undefined
    ): TirExpr | undefined
    {
        let listType: TirType | undefined = typeHint;
        let elemsType: TirType | undefined = undefined;
        if( listType )
        {
            if( !canAssignTo( listType, any_list_t ) )
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    expr.range, "List<T>", listType.toString()
                );
            else
                elemsType = getListTypeArg( listType );
        }

        if( expr.elems.length === 0 )
        {
            if( !listType ) return this.error(
                DiagnosticCode.Empty_array_litteral_must_be_explicitly_cast_to_a_type,
                expr.range
            );

            return new TirLitArrExpr(
                [],
                listType,
                expr.range,
            );
        }

        const fstCompiledExpr = this._compileExpr( ctx, expr.elems[0], elemsType );
        if( !fstCompiledExpr ) return undefined;
        
        if( !elemsType ) elemsType = fstCompiledExpr.type;
        else if( !canAssignTo( fstCompiledExpr.type, elemsType ) ) {
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                expr.elems[0].range, fstCompiledExpr.type, elemsType
            );
        }

        if( !listType  ) listType  = new TirListT( elemsType ); 

        const restElems = expr.elems.slice( 1 );
        const compiledRestElems = restElems.map( elem => {
            const compiled = this._compileExpr( ctx, elem, elemsType );
            if( !compiled ) return undefined;
            if( !canAssignTo( compiled.type, elemsType! ) )
            {
                return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    elem.range, compiled.type, elemsType
                );
            }
            return compiled;
        });
        if( compiledRestElems.some( x => !isTirExpr( x )) ) return undefined;

        return new TirLitArrExpr(
            [ fstCompiledExpr, ...(compiledRestElems as TirExpr[]) ],
            listType,
            expr.range
        );
    }

    /**
     * Collect all types declared in the top-level statements
     * 
     * @returns the file top-level scope ( preludeScope <- imports <- fileTopLevelDecls )
     * /
    collectTypes( ctx: AstCompilationCtx, topLevelStmts: PebbleStmt[] ): Scope
    {
        const importsScope = new Scope(
            this.preludeScope,
            { isFunctionDeclScope: false }
        );
        this.collectImportedTypes( importsScope, topLevelStmts );
        const fileTopLevelDeclsScope = new Scope( importsScope );
        this.collectFileDeclaredTypes( fileTopLevelDeclsScope, topLevelStmts );
        return fileTopLevelDeclsScope
    }
    //*/

    /**
     * Collect all imported types
     */
    collectImportedTypes( ctx: AstCompilationCtx, imports: PebbleStmt[] ): void
    {
        for( const stmt of imports )
        {
            if( stmt instanceof ImportStmt )
            {
                const importPath = stmt.fromPath.string;
                continue;
            }
            if( stmt instanceof ImportStarStmt )
            {
                const importPath = stmt.fromPath.string;
                continue;
            }
        }
    }

    /** MUST NOT be used as a "seen" log */
    private readonly _sourceCache = new Map<string, Source>();
    async sourceFromInternalPath(
        internalPath: string
    ): Promise<Source | undefined>
    {
        const cached = this.parsedAstSources.get( internalPath ) ?? this._sourceCache.get( internalPath );
        if( cached ) return cached;

        const srcText = await this.io.readFile( internalPath + extension, this.rootPath );
        if( !srcText )
        {
            console.log( internalPath );
            return this.error(
                DiagnosticCode.File_0_not_found,
                undefined, internalPath
            );
        }

        const src = new Source(
            SourceKind.User,
            internalPath,
            srcText
        );
        this._sourceCache.set( internalPath, src );
        return src;
    }

    /**
     * @returns `true` if there were no errors. `false` otherwise.
     */
    async parseAllImportedFiles(
        _resolveStackNode: ResolveStackNode
    ): Promise<boolean>
    {
        const src = _resolveStackNode.dependent; // resolveStackNode instanceof ResolveStackNode ? source.dependent : source;
        const resolveStack = _resolveStackNode; // source instanceof ResolveStackNode ? source : new ResolveStackNode( undefined, src );

        const isCycle = resolveStack.parent?.includesInternalPath( src.internalPath ) ?? false;

        if( isCycle )
        {
            this._reportCircularDependency( src, resolveStack );
            return false;
        }

        if( this.parsedAstSources.has( src.internalPath ) ) return true;
        Parser.parseSource( src, this.diagnostics );
        this.parsedAstSources.set( src.internalPath, src );

        if( this.diagnostics.length > 0 ) return false;

        // get all imports to parse recursively
        const imports = src.statements.filter( isImportStmtLike );

        const srcPath = resolveStack.dependent.internalPath;
        const paths = this.importPathsFromStmts( imports, srcPath );
        const sources = await Promise.all(
            paths.map( this.sourceFromInternalPath.bind( this ) )
        );
        
        for( const src of sources )
        {
            if( !src ) continue; // error already reported in `importPathsFromStmts`

            const nextStack = new ResolveStackNode( resolveStack, src );
            // recursively parse imported files
            if( !await this.parseAllImportedFiles( nextStack ) ) return false;
        }

        this._compileParsedSource( src );

        return true;
    }

    private importPathsFromStmts(
        stmts: ImportStmtLike[],
        requestingPath: string
    ): string[]
    {
        return stmts
        .map( imp => {
            const internalPath = resolveProjAbsolutePath(
                imp.fromPath.string,
                requestingPath
            );
            if( !internalPath )
            {
                this.error(
                    DiagnosticCode.File_0_not_found,
                    imp.fromPath.range, imp.fromPath.string
                );
                return "";
            }
            return getInternalPath( internalPath );
        })
        .filter( path => path !== "" );
    }

    private _reportCircularDependency(
        src: Source,
        resolveStack: ResolveStackNode
    ): void
    {
        const offendingPath = src.internalPath;
        let prevPath = offendingPath;
        let req: ResolveStackNode = resolveStack;
        const pathsInCycle: string[] = [];
        const seen = new Set<string>();

        // we go through the loop so we can signal the error
        // at every offending import
        while( req = req.parent! ) {
            const importStmt = req.dependent.statements.find( stmt => {
                if( !isImportStmtLike( stmt ) ) return false;

                const asRootPath = resolveProjAbsolutePath(
                    stmt.fromPath.string,
                    req.dependent.internalPath
                );
                if( !asRootPath ) return false;

                return asRootPath === prevPath
            }) as ImportStmtLike | undefined;

            prevPath = getInternalPath( req.dependent.internalPath ); 
            if( !importStmt )
            {
                this.error(
                    DiagnosticCode.Import_path_0_is_part_of_a_circular_dependency,
                    new SourceRange( req.dependent, 0, 0 ),
                    offendingPath
                );
                continue;
            }
            
            const thePath = importStmt.fromPath.string;
            const last = seen.has( thePath ) 
            
            if( !last )
            {
                pathsInCycle.push( thePath );
                seen.add( thePath );
            }

            pathsInCycle.push( thePath );
            this.error(
                DiagnosticCode.Import_path_0_is_part_of_a_circular_dependency,
                importStmt.range, thePath
            );
            if( last ) break;
        };
    }
}

type ImportStmtLike = ImportStarStmt | ImportStmt | ExportStarStmt;

function isImportStmtLike( stmt: any ): stmt is ImportStmtLike
{
    return (
        stmt instanceof ImportStmt
        || stmt instanceof ImportStarStmt
        || stmt instanceof ExportStarStmt
    );
}