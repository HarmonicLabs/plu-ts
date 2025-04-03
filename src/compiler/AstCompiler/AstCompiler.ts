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
import { _compileExpr } from "./internal/exprs/_compileExpr";
import { _compileConcreteTypeExpr } from "./internal/types/_compileConcreteTypeExpr";

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
                        const fieldType  = _compileConcreteTypeExpr(
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
        const aliasedType = _compileConcreteTypeExpr(
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