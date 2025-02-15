import { FuncDecl } from "../../ast/nodes/statements/declarations/FuncDecl";
import { StructDecl } from "../../ast/nodes/statements/declarations/StructDecl";
import { TypeAliasDecl } from "../../ast/nodes/statements/declarations/TypeAliasDecl";
import { SimpleVarDecl } from "../../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { ExportStarStmt } from "../../ast/nodes/statements/ExportStarStmt";
import { ImportStarStmt } from "../../ast/nodes/statements/ImportStarStmt";
import { ImportStmt } from "../../ast/nodes/statements/ImportStmt";
import { PebbleStmt } from "../../ast/nodes/statements/PebbleStmt";
import { TypeImplementsStmt } from "../../ast/nodes/statements/TypeImplementsStmt";
import { AstNamedTypeExpr } from "../../ast/nodes/types/AstNamedTypeExpr";
import { AstBooleanType, AstBytesType, AstNumberType, AstVoidType } from "../../ast/nodes/types/AstNativeTypeExpr";
import { AstTypeExpr } from "../../ast/nodes/types/AstTypeExpr";
import { Source, SourceKind } from "../../ast/Source/Source";
import { SourceRange } from "../../ast/Source/SourceRange";
import { extension } from "../../common";
import { DiagnosticEmitter } from "../../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { DiagnosticCode } from "../../diagnostics/diagnosticMessages.generated";
import { CompilerOptions } from "../../IR/toUPLC/CompilerOptions";
import { Parser } from "../../parser/Parser";
import { TirBoolT, TirBytesT, TirIntT, TirVoidT } from "../../tir/TirNativeType";
import { TirStructConstr, TirStructField, TirStructType } from "../../tir/TirStructType";
import { TirType } from "../../tir/TirType";
import { CompilerIoApi, createMemoryCompilerIoApi } from "../io/CompilerIoApi";
import { IPebbleCompiler } from "../IPebbleCompiler";
import { getInternalPath, Path, resolveProjAbsolutePath } from "../path/path";
import { ResolveStackNode } from "./ResolveStackNode";
import { Scope } from "./scope/Scope";
import { stdTypesSrc } from "./scope/stdScope/std/stdTypes";
import { stdScope } from "./scope/stdScope/stdScope";
 
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
    readonly stdScope: Scope;

    constructor(
        readonly cfg: CompilerOptions,
        readonly io: CompilerIoApi = createMemoryCompilerIoApi({ useConsoleAsOutput: true }),
        readonly rootPath: string = "/",
        diagnostics?: DiagnosticMessage[]
    )
    {
        super( diagnostics );
        this.stdScope = this._getInitScope();
    }

    private _getInitScope(): Scope
    {
        const scope = stdScope.clone();

        const [ source, diagnostics ] = Parser.parseFile("prelude.pebble", stdTypesSrc, false);
        if( diagnostics.length > 0 )
        {
            for( const msg of diagnostics )
                this.emitDiagnosticMessage( msg );

            throw new Error("Failed to parse prelude.pebble");
        }

        const stmts = source.statements;
        const typeImpls: TypeImplementsStmt[] = []; 
        for( const stmt of stmts )
        {
            if( stmt instanceof StructDecl || stmt instanceof TypeAliasDecl )
                this.pushTypeDecl( stmt, scope );
            else if( stmt instanceof TypeImplementsStmt )
                typeImpls.push( stmt );
        }
        for( const stmt of typeImpls )
            this.pushTypeImpl( stmt, scope );

        return scope;
    }

    private _compileInitStructDecl(
        decl: StructDecl,
        scope: Scope
    ): TirStructType
    {
        const constrs: TirStructConstr[] = new Array( decl.constrs.length );
        for( let i = 0; i < decl.constrs.length; i++ )
        {
            const constr = decl.constrs[ i ];
            const fields: TirStructField[] = new Array( constr.fields.length );
            for( let j = 0; j < constr.fields.length; j++ )
            {
                const field = constr.fields[ j ];
                if(!( field instanceof SimpleVarDecl ))
                {
                    this.error(
                        DiagnosticCode.Invalid_field_declaration,
                        field.range
                    );
                    continue;
                }
                if( !field.type )
                {
                    this.error(
                        DiagnosticCode.Field_declarations_must_be_typed,
                        field.range
                    );
                    continue;
                }
                if( field.initExpr )
                {
                    this.error(
                        DiagnosticCode.Initialization_expressions_are_not_allowed_in_a_struct_declaration,
                        field.initExpr.range
                    ); // recoverable (just ignore the initializer)
                }
                fields[ j ] = new TirStructField(
                    field.name.text,
                    // we can only afford this "blind" `resolveType`
                    // because we know the source parsed
                    // and we know that the type definitions are sorted
                    this._compileTypeExpr( field.type, scope ),
                );
            }
            constrs[ i ] = {
                name: constr.name.text,
                fields
            };
        }
        return new TirStructType(
            decl.name.text,
            constrs,
            []
        );
    }

    private _compileTypeExpr(
        typeExpr: AstTypeExpr,
        scope: Scope
    ): TirType
    {
        if( typeExpr instanceof AstNamedTypeExpr )
            return this._compileNamedTypeExpr( typeExpr, scope );
        else
            return this._compileNativeTypeExpr( typeExpr );
    }

    private _compileNamedTypeExpr(
        typeExpr: AstNamedTypeExpr,
        scope: Scope
    ): TirType
    {

    }

    private _compileNativeTypeExpr(
        typeExpr: AstTypeExpr,
        scope: Scope
    ): TirType
    {
        if( typeExpr instanceof AstVoidType ) return new TirVoidT();
        else if( typeExpr instanceof AstBooleanType ) return new TirBoolT();
        else if( typeExpr instanceof AstNumberType ) return new TirIntT();
        else if( typeExpr instanceof AstBytesType ) return new TirBytesT();
        
    }

    // readonly depGraph = new DependencyGraph();
    // readonly exportedSymbols = new Map<string, Source>();

    async compileFile(
        path: string,
        srcText: string | undefined = undefined,
        isEntry: boolean = true
    )
    {
        const internalPath = getInternalPath( path );
        srcText = srcText ?? await this.io.readFile( internalPath, this.rootPath );
        if( !srcText )
        {
            this.error(
                DiagnosticCode.File_0_not_found,
                undefined, path
            );
            return;
        }
        const src = new Source(
            SourceKind.User,
            internalPath,
            srcText
        );

        return this.compileSource( src );
    }

    async compileSource( src: Source )
    {
        await this._checkCircularDependencies( src );

        await this.compileEntryFileStmts( src.statements );

        return this.diagnostics;
    }

    async compileEntryFileStmts( src: PebbleStmt[] )
    {
        const mainFunc = src.find( stmt => {
            stmt instanceof FuncDecl
        })
    }

    async checkCircularDependencies( src: Source | Path ): Promise<DiagnosticMessage[]>
    {
        if(!( src instanceof Source ))
        {
            src = src.toString();
            src = getInternalPath( src );
            src = (await this.sourceFromInternalPath( src ))!;
            if( !src ) return this.diagnostics;
        }
        await this._checkCircularDependencies( src );
        return this.diagnostics;
    }

    /** MUST NOT be used as a "seen" log */
    private readonly _sourceCache = new Map<string, Source>();
    async sourceFromInternalPath(
        internalPath: string
    ): Promise<Source | undefined>
    {
        const cached = this._sourceCache.get( internalPath );
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
    sourceFromInternalPathSync(
        internalPath: string
    ): Source | undefined
    {
        return this._sourceCache.get( internalPath );
    }

    /**
     * 
     * @returns `true` if there were no errors. `false` otherwise.
     */
    private async _checkCircularDependencies(
        source: Source | ResolveStackNode
    ): Promise<boolean>
    {
        const src = source instanceof ResolveStackNode ? source.dependent : source;
        const resolveStack = source instanceof ResolveStackNode ? source : new ResolveStackNode( undefined, src );

        const isCycle = resolveStack.parent?.includesInternalPath( src.internalPath ) ?? false;

        if( isCycle )
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

            // this.io.stderr.write(
            //     "Circular dependency detected:\n" +
            //     pathsInCycle.map( path => "  " + path ).join("\n") +
            //     "\n"
            // );
            return false;
        }

        const diagnostics = Parser.parseSource( src, [] );

        if( diagnostics.length > 0 )
        {
            for( const msg of diagnostics )
                this.emitDiagnosticMessage( msg );
            return false;
        }

        const stmts = src.statements;

        const imports = stmts.filter( isImportStmtLike );

        // const srcPath = src.internalPath;
        // const importPaths = this.importPathsFromStmts( imports, srcPath );
        // this.depGraph.addDependencies( srcPath, importPaths );

        return await this.checkCircularDependenciesDependencies(
            imports,
            resolveStack
        );
    }

    private importPathsFromStmts(
        stmts: ImportStmtLike[],
        requestingPath: string
    )
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

    async checkCircularDependenciesDependencies(
        imports: ImportStmtLike[],
        dependent: ResolveStackNode
    ): Promise<boolean>
    {
        const srcPath = dependent.dependent.internalPath;
        const paths = this.importPathsFromStmts( imports, srcPath );
        const sources = await Promise.all(
            paths.map( this.sourceFromInternalPath.bind( this ) )
        );
        
        for( const src of sources )
        {
             if( !src ) continue; // error already reported parsing import

            const resolveStack = new ResolveStackNode( dependent, src );
            if( !await this._checkCircularDependencies( resolveStack ) ) return false;
        }

        return true;
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