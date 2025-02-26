import { TirForOfStmt } from "./TirForOfStmt";
import { TirForStmt } from "./TirForStmt";
import { TirFuncDecl, TirSimpleFuncParam } from "./TirFuncDecl";
import { TirIfStmt } from "./TirIfStmt";
import { TirSimpleVarDecl } from "./TirVarDecl/TirSimpleVarDecl";

export type TirStmt
    = TirIfStmt
    | TirVarDecl
    | TirFuncDecl
    // destructured params are immediately replaced at translation
    // TIR only has simple parameters
    // AST destructured params just become
    // 
    // function astFunc({ a, b }: Thing) { ... }
    //
    // function tirFunc( §thing#1a3f: Thing ) {
    //     const { a, b } = §thing#1a3f;
    // }
    | TirSimpleFuncParam
    | TirForStmt
    // easier to optimize than normal for loop
    // we remember the difference between the two 
    | TirForOfStmt
    | TirWhileStmt
    | TirReturnStmt
    | TirBlockStmt
    | TirBreakStmt
    | TirContinueStmt
    | TirFailStmt
    | TirAssertStmt
    | TirTestStmt
    | TirMatchStmt
    | TirExportStarStmt
    | TirImportStarStmt
    | TirExportStmt
    | TirImportStmt
    | TirTypeImplementsStmt
    | TirAssignmentStmt
    ;

export type TirVarDecl
    = TirSimpleVarDecl
    | TirNamedDeconstructVarDecl
    | TirSingleDeconstructVarDecl
    | TirArrayLikeDeconstr
    ;

export function isTirStmt( thing: any ): thing is TirStmt
{
    return false;
}