import { AssertStmt } from "../../../../ast/nodes/statements/AssertStmt";
import { isAssignmentStmt } from "../../../../ast/nodes/statements/AssignmentStmt";
import { BlockStmt } from "../../../../ast/nodes/statements/BlockStmt";
import { BreakStmt } from "../../../../ast/nodes/statements/BreakStmt";
import { ContinueStmt } from "../../../../ast/nodes/statements/ContinueStmt";
import { FuncDecl } from "../../../../ast/nodes/statements/declarations/FuncDecl";
import { isPebbleAstTypeDecl } from "../../../../ast/nodes/statements/declarations/PebbleAstTypeDecl";
import { EmptyStmt } from "../../../../ast/nodes/statements/EmptyStmt";
import { ExportImportStmt } from "../../../../ast/nodes/statements/ExportImportStmt";
import { ExportStarStmt } from "../../../../ast/nodes/statements/ExportStarStmt";
import { ExportStmt } from "../../../../ast/nodes/statements/ExportStmt";
import { ExprStmt } from "../../../../ast/nodes/statements/ExprStmt";
import { FailStmt } from "../../../../ast/nodes/statements/FailStmt";
import { ForOfStmt } from "../../../../ast/nodes/statements/ForOfStmt";
import { ForStmt } from "../../../../ast/nodes/statements/ForStmt";
import { IfStmt } from "../../../../ast/nodes/statements/IfStmt";
import { ImportStmt } from "../../../../ast/nodes/statements/ImportStmt";
import { MatchStmt } from "../../../../ast/nodes/statements/MatchStmt";
import { PebbleStmt } from "../../../../ast/nodes/statements/PebbleStmt";
import { ReturnStmt } from "../../../../ast/nodes/statements/ReturnStmt";
import { TestStmt } from "../../../../ast/nodes/statements/TestStmt";
import { TypeImplementsStmt } from "../../../../ast/nodes/statements/TypeImplementsStmt";
import { UsingStmt } from "../../../../ast/nodes/statements/UsingStmt";
import { VarStmt } from "../../../../ast/nodes/statements/VarStmt";
import { WhileStmt } from "../../../../ast/nodes/statements/WhileStmt";
import { TirSource } from "../../../tir/program/TirSource";
import { ImportStarStmt } from "../../../tir/statements/TirImportStarStmt";
import { TirStmt } from "../../../tir/statements/TirStmt";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileAssertStmt } from "./_compileAssertStmt";
import { _compileAssignmentStmt } from "./_compileAssignmentStmt";
import { _compileBlockStmt } from "./_compileBlockStmt";
import { _compileBreakStmt } from "./_compileBreakStmt";
import { _compileContinueStmt } from "./_compileContinueStmt";
import { _compileExportStmt } from "./_compileExportStmt";
import { _compileExprStmt } from "./_compileExprStmt";
import { _compileFailStmt } from "./_compileFailStmt";
import { _compileForOfStmt } from "./_compileForOfStmt";
import { _compileForStmt } from "./_compileForStmt";
import { _compileFuncDecl } from "./_compileFuncDecl";
import { _compileIfStmt } from "./_compileIfStmt";
import { _compileMatchStmt } from "./_compileMatchStmt";
import { _compileReturnStmt } from "./_compileReturnStmt";
import { _compileTestStmt } from "./_compileTestStmt";
import { _compileUsingStmt } from "./_compileUsingStmt";
import { _compileVarStmt } from "./_compileVarStmt";
import { _compileWhileStmt } from "./_compileWhileStmt";

/**
 * here we just translate to TIR
 * 
 * WE DO NOT OPTIMIZE
 * 
 * optimizaitons are part of the TIR -> TermIR compilation
**/
export function _compileStatement(
    ctx: AstCompilationCtx,
    stmt: PebbleStmt,
    // only passed for top level statements
    // where exports are expected
    tirSource: TirSource | undefined = undefined
): TirStmt[] | undefined
{
    if(
        stmt instanceof ExportStarStmt
        || stmt instanceof ImportStarStmt
        || stmt instanceof ExportImportStmt
        || stmt instanceof ImportStmt
    ) throw new Error("export/import statements should be handled separately, not in _compileStatement");

    if(
        isPebbleAstTypeDecl( stmt )
        || stmt instanceof TypeImplementsStmt
    ) throw new Error(
        "type declarations and interface implementations should be " +
        "handled separately, not in _compileStatement"
    );

    if( stmt instanceof ExportStmt ) return _compileExportStmt( ctx, stmt, tirSource );
    
    if( stmt instanceof IfStmt ) return _compileIfStmt( ctx, stmt );
    if( stmt instanceof VarStmt ) return _compileVarStmt( ctx, stmt, !!tirSource );
    if( stmt instanceof ForStmt ) return _compileForStmt( ctx, stmt );
    if( stmt instanceof ForOfStmt ) return _compileForOfStmt( ctx, stmt );
    if( stmt instanceof WhileStmt ) return _compileWhileStmt( ctx, stmt );
    if( stmt instanceof ReturnStmt ) return _compileReturnStmt( ctx, stmt );
    if( stmt instanceof BlockStmt ) return _compileBlockStmt( ctx, stmt );
    if( stmt instanceof BreakStmt ) return _compileBreakStmt( ctx, stmt );
    if( stmt instanceof ContinueStmt ) return _compileContinueStmt( ctx, stmt );
    if( stmt instanceof EmptyStmt ) return [];
    if( stmt instanceof FailStmt ) return _compileFailStmt( ctx, stmt );
    if( stmt instanceof AssertStmt ) return _compileAssertStmt( ctx, stmt );
    if( stmt instanceof TestStmt ) return _compileTestStmt( ctx, stmt );
    if( stmt instanceof MatchStmt ) return _compileMatchStmt( ctx, stmt );
    if( isAssignmentStmt( stmt ) ) return _compileAssignmentStmt( ctx, stmt );
    if( stmt instanceof ExprStmt ) return _compileExprStmt( ctx, stmt );
    if( stmt instanceof UsingStmt ) return _compileUsingStmt( ctx, stmt );
    if( stmt instanceof FuncDecl ) return _compileFuncDecl( ctx, stmt );

    console.error( stmt );
    throw new Error("unreachable::AstCompiler::_compileStatement");
}