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
import { CommonFlags, extension } from "../../common";
import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { DiagnosticCode } from "../../diagnostics/diagnosticMessages.generated";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { Parser } from "../../parser/Parser";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";
import { getInternalPath, InternalPath, resolveProjAbsolutePath } from "../path/path";
import { ResolveStackNode } from "./ResolveStackNode";
import { getAppliedTypeInternalName, Scope } from "./scope/Scope";
import { EnumDecl } from "../../ast/nodes/statements/declarations/EnumDecl";
import { TirProgram } from "../tir/program/TirProgram";
import { any_list_t, any_optional_t, bool_sym, bool_t, bytes_t, int_t, preludeScope, string_t, void_t } from "./scope/stdScope/stdScope";
import { TirSource } from "../tir/program/TirSource";
import { TirStmt } from "../tir/statements/TirStmt";
import { PebbleExpr } from "../../ast/nodes/expr/PebbleExpr";
import { isTirExpr, TirExpr } from "../tir/expressions/TirExpr";
import { UnaryExclamation } from "../../ast/nodes/expr/unary/UnaryExclamation";
import { TirUnaryExclamation } from "../tir/expressions/unary/TirUnaryExclamation";
import { TirDataT, TirLinearMapT, TirListT, TirOptT } from "../tir/types/TirNativeType";
import { canAssignTo, getStructType, isStructOrStructAlias } from "../tir/types/type-check-utils/canAssignTo";
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
import { PebbleConcreteTypeSym } from "./scope/symbols/PebbleSym";
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
import { TirStructConstr, TirStructType } from "../tir/types/TirStructType";
import { ParentesizedExpr } from "../../ast/nodes/expr/ParentesizedExpr";
import { FuncExpr } from "../../ast/nodes/expr/functions/FuncExpr";
import { CallExpr } from "../../ast/nodes/expr/functions/CallExpr";
import { IsExpr } from "../../ast/nodes/expr/IsExpr";
import { ElemAccessExpr } from "../../ast/nodes/expr/ElemAccessExpr";
import { TernaryExpr } from "../../ast/nodes/expr/TernaryExpr";
import { isPropAccessExpr, PropAccessExpr } from "../../ast/nodes/expr/PropAccessExpr";
import { CaseExpr } from "../../ast/nodes/expr/CaseExpr";
import { TypeConversionExpr } from "../../ast/nodes/expr/TypeConversionExpr";
import { NonNullExpr } from "../../ast/nodes/expr/unary/NonNullExpr";
import { IfStmt } from "../../ast/nodes/statements/IfStmt";
import { TirIfStmt } from "../tir/statements/TirIfStmt";
import { VarStmt } from "../../ast/nodes/statements/VarStmt";
import { ForStmt } from "../../ast/nodes/statements/ForStmt";
import { ForOfStmt } from "../../ast/nodes/statements/ForOfStmt";
import { BlockStmt } from "../../ast/nodes/statements/BlockStmt";
import { AssertStmt } from "../../ast/nodes/statements/AssertStmt";
import { isPebbleDecl } from "../../ast/nodes/statements/declarations/PebbleDecl";
import { BreakStmt } from "../../ast/nodes/statements/BreakStmt";
import { ContinueStmt } from "../../ast/nodes/statements/ContinueStmt";
import { EmptyStmt } from "../../ast/nodes/statements/EmptyStmt";
import { FailStmt } from "../../ast/nodes/statements/FailStmt";
import { MatchStmt, MatchStmtCase } from "../../ast/nodes/statements/MatchStmt";
import { ReturnStmt } from "../../ast/nodes/statements/ReturnStmt";
import { TestStmt } from "../../ast/nodes/statements/TestStmt";
import { WhileStmt } from "../../ast/nodes/statements/WhileStmt";
import { ExportStmt } from "../../ast/nodes/statements/ExportStmt";
import { AddAssignmentStmt, AssignmentStmt, BitwiseAndAssignmentStmt, BitwiseOrAssignmentStmt, BitwiseXorAssignmentStmt, DivAssignmentStmt, ExpAssignmentStmt, isAssignmentStmt, LogicalAndAssignmentStmt, LogicalOrAssignmentStmt, ModuloAssignmentStmt, MultAssignmentStmt, ShiftLeftAssignmentStmt, ShiftRightAssignmentStmt, SimpleAssignmentStmt, SubAssignmentStmt } from "../../ast/nodes/statements/AssignmentStmt";
import { ExprStmt } from "../../ast/nodes/statements/ExprStmt";
import { VarDecl } from "../../ast/nodes/statements/declarations/VarDecl/VarDecl";
import { SimpleVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { NamedDeconstructVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/NamedDeconstructVarDecl";
import { ISingleDeconstructVarDecl, SingleDeconstructVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/SingleDeconstructVarDecl";
import { ArrayLikeDeconstr } from "../../ast/nodes/statements/declarations/VarDecl/ArrayLikeDeconstr";
import { AstTypeExpr } from "../../ast/nodes/types/AstTypeExpr";
import { AstBooleanType, AstBytesType, AstIntType, AstNativeOptionalType, AstVoidType, isAstNativeTypeExpr } from "../../ast/nodes/types/AstNativeTypeExpr";
import { TirSimpleVarDecl } from "../tir/statements/TirVarDecl/TirSimpleVarDecl";
import { TirNamedDeconstructVarDecl } from "../tir/statements/TirVarDecl/TirNamedDeconstructVarDecl";
import { TirSingleDeconstructVarDecl } from "../tir/statements/TirVarDecl/TirSingleDeconstructVarDecl";
import { TirArrayLikeDeconstr } from "../tir/statements/TirVarDecl/TirArrayLikeDeconstr";
import { Identifier } from "../../ast/nodes/common/Identifier";
import { TirVarDecl } from "../tir/statements/TirVarDecl/TirVarDecl";
import { wrapManyStatements } from "./wrapManyStatementsOrReturnSame";
import { TirForStmt } from "../tir/statements/TirForStmt";
import { IncrStmt } from "../../ast/nodes/statements/IncrStmt";
import { DecrStmt } from "../../ast/nodes/statements/DecrStmt";
import { TirAssignmentStmt } from "../tir/statements/TirAssignmentStmt";
import { TirAddExpr, TirBitwiseAndExpr, TirBitwiseOrExpr, TirBitwiseXorExpr, TirDivExpr, TirExponentiationExpr, TirLogicalAndExpr, TirLogicalOrExpr, TirModuloExpr, TirMultExpr, TirShiftLeftExpr, TirShiftRightExpr, TirSubExpr } from "../tir/expressions/binary/TirBinaryExpr";
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

export interface ICompileStmtCtx {
    scope: Scope;
    /** present if the statement is in a function body */
    functionCtx: CompileFuncCtx | undefined;
    /** to check if `continue` and `break` are valid in this contex */
    isLoop: boolean;
}

export class CompileStmtCtx implements ICompileStmtCtx
{
    constructor(
        readonly scope: Scope,
        readonly functionCtx: CompileFuncCtx | undefined,
        readonly isLoop: boolean
    ) {}

    newChildScope( isLoop = false ): CompileStmtCtx
    {
        return new CompileStmtCtx(
            this.scope.newChildScope(),
            this.functionCtx,
            isLoop
        );
    }

    static fromScopeOnly( scope: Scope ): CompileStmtCtx
    {
        return new CompileStmtCtx(
            scope,
            undefined,
            false
        );
    }
}

export interface CompileFuncCtx {
    /** present where the function definition is inside
     * an other funciton definiton (closure)
     * 
     * in which case, only constants from the parent funciton can be used
    **/
    parentFunctionCtx: CompileFuncCtx | undefined;
    returnHints: {
        type: TirType | undefined;
        isInferred: boolean;
    };
}

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
    private async _compileParsedSource( src: Source )
    {
        if( src.statements.length === 0 )
        {
            throw new Error("_compileParsedSource: source has no statements");
        }

        const tirSource = new TirSource(
            src.internalPath,
            preludeScope
        );
        this._compileSourceStatements( tirSource, src.statements )

        this.program.files.set(
            src.internalPath,
            tirSource
        );

        return this.diagnostics;
    }

    /**
     * assumes the types have been collected before
     */
    private _compileSourceStatements( tirSource: TirSource, stmts: PebbleStmt[] ): void
    {
        const tirSrcScope = tirSource.scope;
        const nAstStmts = stmts.length;
        for( let i = 0; i < nAstStmts; i++ )
        {
            const stmt = stmts[i];
            const tirStmts = this._compileStatement( CompileStmtCtx.fromScopeOnly( tirSrcScope ), stmt );
            if( !Array.isArray( tirStmts ) ) return undefined;
            tirSource.statements.push(
                ...tirStmts
            );
        }
    }
    
    /**
     * here we just translate to TIR
     * 
     * WE DO NOT OPTIMIZE
     * 
     * optimizaitons are part of the TIR -> TermIR compilation
    **/
    private _compileStatement(
        ctx: CompileStmtCtx,
        stmt: PebbleStmt,
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirStmt[] | undefined
    {
        if(
            stmt instanceof ExportStarStmt
            || stmt instanceof ImportStarStmt
            || stmt instanceof ExportStmt
            || stmt instanceof ImportStmt
        ) throw new Error("export/import statements should be handled separately, not in _compileStatement");
            
        if( stmt instanceof IfStmt ) return this._compileIfStmt( ctx, stmt );
        if( stmt instanceof VarStmt ) return this._compileVarStmt( ctx.scope, stmt );
        if( stmt instanceof ForStmt ) return this._compileForStmt( ctx, stmt );
        if( stmt instanceof ForOfStmt ) return this._compileForOfStmt( ctx, stmt );
        if( stmt instanceof WhileStmt ) return this._compileWhileStmt( ctx, stmt );
        if( stmt instanceof ReturnStmt ) return this._compileReturnStmt( ctx, stmt );
        if( stmt instanceof BlockStmt ) return this._compileBlockStmt( ctx, stmt );
        if( stmt instanceof BreakStmt ) return this._compileBreakStmt( ctx, stmt );
        if( stmt instanceof ContinueStmt ) return this._compileContinueStmt( ctx, stmt );
        if( stmt instanceof EmptyStmt ) return [];
        if( stmt instanceof FailStmt ) return this._compileFailStmt( ctx, stmt );
        if( stmt instanceof AssertStmt ) return this._compileAssertStmt( ctx, stmt );
        if( stmt instanceof TestStmt ) return this._compileTestStmt( ctx, stmt );
        if( stmt instanceof MatchStmt ) return this._compileMatchStmt( ctx, stmt );
        /* MOVE ME
        if( isPebbleDecl( stmt ) ) return this._compilePebbleDecl( ctx, stmt );
        if( stmt instanceof TypeImplementsStmt ) return this._compileTypeImplementsStmt( ctx, stmt );
        if( isAssignmentStmt( stmt ) ) return this._compileAssignmentStmt( ctx, stmt );
        if( stmt instanceof ExprStmt ) return this._compileExprStmt( ctx, stmt );
        if( stmt instanceof IncrStmt ) return this._compileIncrStmt( ctx, stmt );
        if( stmt instanceof DecrStmt ) return this._compileDecrStmt( ctx, stmt );
        //*/

        console.error( stmt );
        throw new Error("unreachable::AstCompiler::_compileStatement");
    }

    private _compileMatchStmt(
        ctx: CompileStmtCtx,
        stmt: MatchStmt
    ): [ TirMatchStmt ] | undefined
    {
        if( !ctx.functionCtx ) return this.error(
            DiagnosticCode.A_match_statement_can_only_be_used_within_a_function_body,
            stmt.range
        );

        const matchExpr = this._compileExpr( ctx.scope, stmt.matchExpr, undefined );
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
        ) ]
    }
    private _compileTirMatchStmtCase(
        ctx: CompileStmtCtx,
        matchCase: MatchStmtCase,
        deconstructableType: DeconstructableTirType,
        constrNamesAlreadySpecified: string[]
    ): TirMatchStmtCase | undefined
    {
        const pattern = this._compileVarDecl( ctx.scope, matchCase.pattern, deconstructableType );
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

                const branchCtx = ctx.newChildScope();

                switch( deconstructedCtorName )
                {
                    case "Constr": {
                        const tirPattern = this._compileNamedDeconstructVarDecl(
                            branchCtx.scope,
                            pattern,
                            deconstructableType
                        );
                        break;
                    }
                    case "Map": {
                        break;
                    }
                    case "List": {
                        break;
                    }
                    case "B": {
                        break;
                    }
                    case "I": {
                        break;
                    }
                    default: throw new Error("unreachable");
                }
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
            }
            else if( deconstructableType instanceof TirStructType )
            {
                pattern.fields;
                const ctorDef = deconstructableType.constructors.find( c => c.name === deconstructedCtorName );
                if( !ctorDef ) return this.error(
                    DiagnosticCode.Unknown_0_constructor_1,
                    pattern.name.range, deconstructableType.toString(), deconstructedCtorName
                );

                ctorDef.fields; // { name, type }[]

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
        }
    }

    private _compileTestStmt(
        ctx: CompileStmtCtx,
        stmt: TestStmt
    ): [ TirTestStmt ] | undefined
    {
        if( ctx.functionCtx ) return this.error(
            DiagnosticCode.A_test_statement_can_only_be_used_outside_a_function,
            stmt.range
        );

        let tirBody = wrapManyStatements(
            this._compileStatement(
                ctx.newChildScope(),
                stmt.body
            )
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
        ctx: CompileStmtCtx,
        stmt: AssertStmt
    ): [ TirAssertStmt ] | undefined
    {
        const tirCond = this._compileExpr( ctx.scope, stmt.condition, bool_t );
        if( !tirCond ) return undefined;
        if(
            !canAssignTo( tirCond.type, bool_t )
            || !canAssignTo( tirCond.type, any_optional_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.condition.range, tirCond.type.toString(), bool_t.toString()
        );

        let failMsgExpr: TirExpr | undefined = undefined;
        if( stmt.elseExpr )
        {
            failMsgExpr = this._compileExpr( ctx.scope, stmt.elseExpr, string_t );
            if( !failMsgExpr ) return undefined;
            if( !canAssignTo( failMsgExpr.type, string_t ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.elseExpr.range, failMsgExpr.type.toString(), string_t.toString()
            );
        }

        return [ new TirAssertStmt( tirCond, failMsgExpr, stmt.range ) ];
    }

    private _compileFailStmt(
        ctx: CompileStmtCtx,
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
            failMsgExpr = this._compileExpr( ctx.scope, stmt.value, string_t );
            if( !failMsgExpr ) return undefined;
            if( !canAssignTo( failMsgExpr.type, string_t ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.value.range, failMsgExpr.type.toString(), string_t.toString()
            );
        }

        return [ new TirFailStmt( failMsgExpr, stmt.range ) ];
    }

    private _compileContinueStmt(
        ctx: CompileStmtCtx,
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
        ctx: CompileStmtCtx,
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
        ctx: CompileStmtCtx,
        stmt: BlockStmt
    ): [ TirBlockStmt ] | undefined
    {
        // stmt.stmts;
        const tirStmts: TirStmt[] = [];
        for( const stmt of tirStmts )
        {
            const tirStmt = this._compileStatement( ctx.newChildScope(), stmt );
            if( !Array.isArray( tirStmt ) ) return undefined;
            tirStmts.push( ...tirStmt );
        }
        return [ new TirBlockStmt( tirStmts, stmt.range ) ];
    }

    private _compileReturnStmt(
        ctx: CompileStmtCtx,
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
            ctx.scope,
            stmt.value,
            hintReturn.type
        ) : undefined;
        if( !expr ) return undefined;

        if( !hintReturn.type ) {
            hintReturn.type = expr.type;
            hintReturn.isInferred = true;
        }

        if( !canAssignTo( expr.type, hintReturn.type ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.value.range, expr.type.toString(), hintReturn.type.toString()
        );

        return [ new TirReturnStmt( expr, stmt.range ) ];
    }

    private _compileWhileStmt(
        ctx: CompileStmtCtx,
        stmt: WhileStmt
    ): [ TirWhileStmt ] | undefined
    {
        const tirCond = this._compileExpr( ctx.scope, stmt.condition, bool_t );
        if( !tirCond ) return undefined;
        if(
            !canAssignTo( tirCond.type, bool_t )
            || !canAssignTo( tirCond.type, any_optional_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.condition.range, tirCond.type.toString(), bool_t.toString()
        );

        const tirBody = wrapManyStatements(
            this._compileStatement(
                ctx.newChildScope(),
                stmt.body
            )
        );
        if( !tirBody ) return undefined;

        return [ new TirWhileStmt(
            tirCond,
            tirBody,
            stmt.range
        ) ];
    }

    private _compileForOfStmt(
        ctx: CompileStmtCtx,
        stmt: ForOfStmt
    ): [ TirForOfStmt ] | undefined
    {

        const iterableExpr = this._compileExpr(
            ctx.scope,
            stmt.iterable,
            any_list_t
        );
        if( !iterableExpr ) return undefined;
        const elemsType = getListTypeArg( iterableExpr.type );
        if( !elemsType ) return this.error(
            DiagnosticCode.The_argument_of_a_for_of_statement_must_be_an_iterable,
            stmt.iterable.range
        );

        const loopInnerCtx = ctx.newChildScope();

        const varDecl = stmt.elemDeclaration.declarations[0];
        const tirVarDecl = this._compileVarDecl(
            loopInnerCtx.scope,
            varDecl,
            elemsType
        );
        if( !tirVarDecl ) return undefined;
        if( !canAssignTo( tirVarDecl.type, elemsType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            varDecl.range, tirVarDecl.type.toString(), elemsType.toString()
        );

        const tirBody = wrapManyStatements(
            this._compileStatement(
                loopInnerCtx.newChildScope(),
                stmt.body
            )
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
        ctx: CompileStmtCtx,
        stmt: ForStmt
    ): [ TirForStmt ] | undefined
    {
        const loopInnerScope = ctx.newChildScope();

        const tirInit = stmt.init ? this._compileVarStmt( loopInnerScope.scope, stmt.init ) : undefined;
        if( !tirInit ) return undefined;

        const tirCond = stmt.condition ? this._compileExpr( loopInnerScope.scope, stmt.condition, bool_t ) : undefined;
        if( !tirCond ) return undefined;

        const tirUpdates = this._compileForUpdateStmts( loopInnerScope, stmt.updates );
        if( !tirUpdates ) return undefined;

        const tirBody = wrapManyStatements(
            this._compileStatement(
                loopInnerScope.newChildScope(),
                stmt.body
            )
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
        ctx: CompileStmtCtx,
        stmts: (AssignmentStmt | IncrStmt | DecrStmt)[]
    ): TirAssignmentStmt[] | undefined
    {
        const tirStmts: TirAssignmentStmt[] = [];
        for( let stmt of stmts )
        {
            if(
                stmt instanceof IncrStmt
                || stmt instanceof DecrStmt
            )
            {
                const varSym = ctx.scope.resolveValue( stmt.operandVarName.text );
                if( !varSym ) return this.error(
                    DiagnosticCode._0_is_not_defined,
                    stmt.operandVarName.range, stmt.operandVarName.text
                );
                const varType = varSym.type;
                if( !canAssignTo( varType, int_t ) ) return this.error(
                    DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                    stmt.operandVarName.range, varType.toString(), int_t.toString()
                );
                const varAccessExpr = new TirVariableAccessExpr(
                    stmt.operandVarName.text,
                    varType,
                    stmt.operandVarName.range
                );
                tirStmts.push( new TirAssignmentStmt(
                    stmt.operandVarName.text,
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
                ) );
            }
            if( isAssignmentStmt( stmt ) )
            {
                const tirStmt = this._compileAssignmentStmt( ctx, stmt );
                if( !tirStmt ) return undefined;
                tirStmts.push( tirStmt );
            }
            else
            {
                console.error( stmt );
                throw new Error("unreachable::AstCompiler::_compileForUpdateStmts");
            }
        }
        return tirStmts;
    }
    private _compileAssignmentStmt(
        { scope }: CompileStmtCtx,
        stmt: AssignmentStmt
    ): TirAssignmentStmt | undefined
    {
        const varSym = scope.resolveValue( stmt.varIdentifier.text );
        if( !varSym ) return this.error(
            DiagnosticCode._0_is_not_defined,
            stmt.varIdentifier.range, stmt.varIdentifier.text
        );
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
            expr = this._compileExpr( scope, stmt.assignedExpr, varType );
            if( !expr ) return undefined;
            if( !canAssignTo( expr.type, varType ) ) return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                stmt.range, expr.type.toString(), varType.toString()
            );
        }
        else if( stmt instanceof AddAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirAddExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof SubAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirSubExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ExpAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirExponentiationExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof MultAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirMultExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof DivAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirDivExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ModuloAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, int_t );
            if( !expr ) return undefined;
            expr = new TirModuloExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ShiftLeftAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirShiftLeftExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof ShiftRightAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirShiftRightExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof BitwiseAndAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirBitwiseAndExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof BitwiseXorAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirBitwiseXorExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof BitwiseOrAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bytes_t );
            if( !expr ) return undefined;
            expr = new TirBitwiseOrExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof LogicalAndAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bool_t );
            if( !expr ) return undefined;
            expr = new TirLogicalAndExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else if( stmt instanceof LogicalOrAssignmentStmt )
        {
            expr = this.__getBinOpAssignmentLeftArg( scope, stmt, varType, bool_t );
            if( !expr ) return undefined;
            expr = new TirLogicalOrExpr(
                varAccessExpr,
                expr,
                stmt.range
            );
        }
        else {
            console.error( stmt );
            throw new Error("unreachable::AstCompiler::_compileAssignmentStmt");
        }

        return new TirAssignmentStmt(
            varAccessExpr,
            expr,
            stmt.range
        );
    }
    private __getBinOpAssignmentLeftArg(
        scope: Scope,
        stmt: AssignmentStmt,
        varType: TirType,
        exprType: TirType
    ): TirExpr | undefined
    {
        if( !canAssignTo( varType, exprType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.varIdentifier.range, varType.toString(), exprType.toString()
        );
        const expr = this._compileExpr( scope, stmt.assignedExpr, exprType );
        if( !expr ) return undefined;
        if( !canAssignTo( expr.type, exprType ) ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.range, expr.type.toString(), exprType.toString()
        );
        return expr;
    }

    private _compileVarStmt(
        scope: Scope,
        stmt: VarStmt,
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirVarDecl[] | undefined
    {
        const tirVarDecls: TirVarDecl[] = [];
        for( const decl of stmt.declarations )
        {
            const tirDecl = this._compileVarDecl( scope, decl, undefined );
            if( !tirDecl ) return undefined;
            tirVarDecls.push( tirDecl );
        }
        return tirVarDecls;
    }
    private _compileVarDecl(
        scope: Scope,
        decl: VarDecl,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirVarDecl | undefined
    {
        if( decl instanceof SimpleVarDecl )
            return this._compileSimpleVarDecl( scope, decl, typeHint );
        if( decl instanceof NamedDeconstructVarDecl )
            return this._compileNamedDeconstructVarDecl( scope, decl, typeHint );
        if( decl instanceof SingleDeconstructVarDecl )
            return this._compileSingleDeconstructVarDecl( scope, decl, typeHint );
        if( decl instanceof ArrayLikeDeconstr )
            return this._compileArrayLikeDeconstr( scope, decl, typeHint );

        console.error( decl );
        throw new Error("unreachable::AstCompiler::_compileVarDecl");
    }
    private _compileSimpleVarDecl(
        scope: Scope,
        decl: SimpleVarDecl,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirVarDecl | undefined
    {
        const typeAndExpr = this._getVarDeclTypeAndExpr( scope, decl, typeHint );
        if( !typeAndExpr ) return undefined;
        const [ finalVarType, initExpr ] = typeAndExpr;

        const success = scope.defineValue({
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
        scope: Scope,
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

        const typeAndExpr = this._getVarDeclTypeAndExpr( scope, decl, typeHint );
        if( !typeAndExpr ) return undefined;
        const [ finalVarType, initExpr ] = typeAndExpr;

        const finalStructType = getStructType( finalVarType )
        if( !finalStructType )
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                decl.range, finalVarType.toString(), "Struct"
            );

        const finalConstructorDef = finalStructType.constructors.find( ctor =>
            ctor.name === decl.name.text
        );
        if( !finalConstructorDef )
            return this.error(
                DiagnosticCode.Construcotr_0_is_not_part_of_the_definiton_of_1,
                decl.name.range, decl.name.text, finalStructType.toString()
            );

        const deconstructedFields = this._getDeconstructedFields(
            scope,
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
    private _compileSingleDeconstructVarDecl(
        scope: Scope,
        decl: SingleDeconstructVarDecl,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirVarDecl | undefined
    {
        const typeAndExpr = this._getVarDeclTypeAndExpr( scope, decl, typeHint  );
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
            scope,
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
        scope: Scope,
        decl: ArrayLikeDeconstr,
        typeHint: TirType | undefined, // coming from deconstructing
        // useful to infer variable type by usage
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): TirArrayLikeDeconstr | undefined
    {
        const typeAndExpr = this._getVarDeclTypeAndExpr( scope, decl, typeHint );
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
                scope,
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
            const success = scope.defineValue({
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
        scope: Scope,
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
                scope,
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
        scope: Scope,
        decl: { type: AstTypeExpr | undefined, initExpr: PebbleExpr | undefined },
        deconstructTypeHint: TirType | undefined, // coming from deconstructing
        // sameLevelStmts: readonly PebbleStmt[],
        // stmtIdx: number
    ): [
        varType: TirType ,
        varInitExpr: TirExpr | undefined // undefined in case of deconstruction
    ] | undefined
    {
        const declarationType = decl.type ? this._compileConcreteTypeExpr( scope, decl.type ) : undefined;
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
        // and we store the type in the var decl type
        // here we check that the type assertion is valid
        if( declarationType && deconstructTypeHint && !canAssignTo( declarationType, typeHint! ) )
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                decl.type!.range, declarationType.toString(), typeHint!.toString()
            );

        // TODO handle better `decl.initExpr` undefined
        // const initExpr = decl.initExpr ? this._compileExpr( scope, decl.initExpr, typeHint ) : undefined;
        // if( !initExpr ) return undefined;

        if( typeHint && !canAssignTo( initExpr.type, typeHint ) )
        {
            return this.error(
                DiagnosticCode.Type_0_is_not_assignable_to_type_1,
                initExpr.range, initExpr.type.toString(), typeHint.toString()
            );
        }

        return [ typeHint ?? initExpr.type, initExpr ];
    }

    private _compileConcreteTypeExpr(
        scope: Scope,
        typeExpr: AstTypeExpr
    ): TirType | undefined
    {
        if( typeExpr instanceof AstVoidType ) return void_t;
        if( typeExpr instanceof AstBooleanType ) return bool_t;
        if( typeExpr instanceof AstIntType ) return int_t;
        if( typeExpr instanceof AstBytesType ) return bytes_t;
        if( typeExpr instanceof AstNativeOptionalType )
        {
            const compiledArg = this._compileConcreteTypeExpr( scope, typeExpr.typeArg );
            if( !compiledArg || !compiledArg.isConcrete() ) return undefined;
            const compiledInternalName = compiledArg.toInternalName();
            let sym = scope.getAppliedGenericType(
                "Optional",
                [  compiledInternalName ]
            );
            if( !sym )
            {
                const inferredType = new TirOptT( compiledArg );
                if( !inferredType.isConcrete() ) return undefined; // unreachable
                sym = new PebbleConcreteTypeSym({
                    name: getAppliedTypeInternalName(
                        "Optional",
                        [ compiledInternalName ]
                    ),
                    concreteType: inferredType
                });
                scope.defineConcreteType( sym );
            }
            return sym.concreteType; // use exsisting type
        }
    }
    
    private _compileIfStmt(
        ctx: CompileStmtCtx,
        stmt: IfStmt
    ): [ TirIfStmt ] | undefined
    {
        const coditionExpr = this._compileExpr( ctx.scope, stmt.condition, bool_t );
        if( !coditionExpr ) return undefined;
        if(
            !canAssignTo( coditionExpr.type, bool_t )
            || !canAssignTo( coditionExpr.type, any_optional_t )
        ) return this.error(
            DiagnosticCode.Type_0_is_not_assignable_to_type_1,
            stmt.condition.range, coditionExpr.type.toString(), "boolean | Optional<T>"
        );
        const thenBranch = wrapManyStatements(
            this._compileStatement(
                ctx.newChildScope(),
                stmt.thenBranch
            )
        );
        if( !thenBranch ) return undefined;

        let elseBranch: TirStmt | undefined = undefined;
        if( stmt.elseBranch )
        {
            elseBranch = wrapManyStatements(
                this._compileStatement(
                    ctx.newChildScope(),
                    stmt.elseBranch
                )
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
        scope: Scope,
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
        if( expr instanceof UnaryExclamation )
        {
            const operand = this._compileExpr( scope, expr.operand, bool_t );
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
        if(
            expr instanceof UnaryPlus
            || expr instanceof UnaryMinus
        )
        {
            const operand = this._compileExpr( scope, expr.operand, int_t );
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
        if( expr instanceof UnaryTilde )
        {
            const operand = this._compileExpr( scope, expr.operand, bytes_t );
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
        if( expr instanceof ParentesizedExpr ) return this._compileExpr( scope, expr.expr, typeHint );
        /* MOVE ME
        if( expr instanceof FuncExpr ) return ...;
        if( expr instanceof CallExpr ) return ...;
        if( expr instanceof CaseExpr ) return ...;
        if( expr instanceof TypeConversionExpr ) return ...;
        if( expr instanceof NonNullExpr ) return ...;
        if( expr instanceof IsExpr ) return ...;
        if( expr instanceof ElemAccessExpr ) return ...;
        if( expr instanceof TernaryExpr ) return ...;
        if( isPropAccessExpr( expr ) ) return this._compilePropAccessExpr( scope, expr, typeHint );
        //*/

        if( isLitteralExpr( expr ) ) return this._compileLitteralExpr( scope, expr, typeHint );

        console.error( expr );
        throw new Error("unreachable::AstCompiler::_compileExpr");
    }

    private _compileLitteralExpr(
        scope: Scope,
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
            const this_t = scope.getThisSym();
            if( !this_t ) return this.error(
                DiagnosticCode._this_cannot_be_referenced_in_current_location,
                expr.range
            );
            return new TirLitThisExpr(
                this_t,
                expr.range
            );
        }
        if( expr instanceof LitArrExpr ) return this._compileLitteralArrayExpr( scope, expr, typeHint );
        if( expr instanceof LitObjExpr ) return this._compileLitteralObjExpr( scope, expr, typeHint );
        if( expr instanceof LitNamedObjExpr ) return this._compileLitteralNamedObjExpr( scope, expr, typeHint );

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
        scope: Scope,
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
            scope.inferStructTypeFromConstructorName( constructorName )?.structSym.concreteType
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
            scope,
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
        scope: Scope,
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
            scope,
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
        scope: Scope,
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
            const initExpr = this._compileExpr( scope, expr.values[initAstExprIdx], fieldDef.type );
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
        scope: Scope,
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

        const fstCompiledExpr = this._compileExpr( scope, expr.elems[0], elemsType );
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
            const compiled = this._compileExpr( scope, elem, elemsType );
            if( !compiled ) return undefined;
            if( !canAssignTo( compiled.type, elemsType ) )
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
     */
    collectTypes( scope: Scope, topLevelStmts: PebbleStmt[] ): Scope
    {
        const importsScope = new Scope( this.preludeScope );
        this.collectImportedTypes( importsScope, topLevelStmts );
        const fileTopLevelDeclsScope = new Scope( importsScope );
        this.collectFileDeclaredTypes( fileTopLevelDeclsScope, topLevelStmts );
        return fileTopLevelDeclsScope
    }

    /**
     * Collect all imported types
     */
    collectImportedTypes( scope: Scope, imports: PebbleStmt[] ): void
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

    /**
     * Collect all types declared in the top-level statements
     */
    collectFileDeclaredTypes( scope: Scope, topLevelStmts: PebbleStmt[] ): void
    {
        for( const stmt of topLevelStmts )
        {
            // if( stmt instanceof ImportStmt )
            // {
            //     const importPath = stmt.fromPath.string;
            //     continue;
            // }
            if( stmt instanceof FuncDecl )
            {
                const funcName = stmt.name.text;
                const isGeneric = stmt.typeParams.length > 0;
                continue;
            }
            if( stmt instanceof StructDecl )
            {
                const structName = stmt.name.text;
                const isGeneric = stmt.typeParams.length > 0;
                continue;
            }
            if( stmt instanceof EnumDecl )
            {
                const enumName = stmt.name.text;
                continue;
            }
            if( stmt instanceof TypeAliasDecl )
            {
                const aliasName = stmt.name.text;
                const isGeneric = stmt.typeParams.length > 0;
                continue;
            }
            if( stmt instanceof TypeImplementsStmt )
            {
                const typeExpr = stmt.typeIdentifier;
                const interfaceTypeExpr = stmt.interfaceType;
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
    private async parseAllImportedFiles(
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