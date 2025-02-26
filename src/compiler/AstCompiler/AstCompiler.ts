import { FuncDecl } from "../../ast/nodes/statements/declarations/FuncDecl";
import { StructDecl } from "../../ast/nodes/statements/declarations/StructDecl";
import { TypeAliasDecl } from "../../ast/nodes/statements/declarations/TypeAliasDecl";
import { SimpleVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { ExportStarStmt } from "../../ast/nodes/statements/ExportStarStmt";
import { ImportStarStmt } from "../../ast/nodes/statements/ImportStarStmt";
import { ImportStmt } from "../../ast/nodes/statements/ImportStmt";
import { isPebbleStmt, PebbleStmt } from "../../ast/nodes/statements/PebbleStmt";
import { TypeImplementsStmt } from "../../ast/nodes/statements/TypeImplementsStmt";
import { Source, SourceKind } from "../../ast/Source/Source";
import { SourceRange } from "../../ast/Source/SourceRange";
import { extension } from "../../common";
import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { DiagnosticCode } from "../../diagnostics/diagnosticMessages.generated";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { Parser } from "../../parser/Parser";
import { TirConcreteStructConstr, TirConcreteStructField, TirConcreteStructType } from "../tir/types/TirConcreteStructType";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";
import { getInternalPath, InternalPath, resolveProjAbsolutePath } from "../path/path";
import { ResolveStackNode } from "./ResolveStackNode";
import { Scope } from "./scope/Scope";
import { EnumDecl } from "../../ast/nodes/statements/declarations/EnumDecl";
import { TirProgram } from "../tir/program/TirProgram";
import { preludeScope, stdScope } from "./scope/stdScope/stdScope";
import { preludeTypesSrc } from "./scope/stdScope/prelude/preludeTypesSrc";

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

        this.program.files.set(
            src.internalPath,
            this._compileSourceStatements( src.statements )
        );

        return this.diagnostics;
    }

    /**
     * assumes the types have been collected before
     */
    private _compileSourceStatements( stmts: PebbleStmt[] )
    {
        const result = [];
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