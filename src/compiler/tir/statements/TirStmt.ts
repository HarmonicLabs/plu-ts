import { isObject } from "@harmoniclabs/obj-utils";
import { TirAssertStmt } from "./TirAssertStmt";
import { TirAssignmentStmt } from "./TirAssignmentStmt";
import { TirBlockStmt } from "./TirBlockStmt";
import { TirBreakStmt } from "./TirBreakStmt";
import { TirContinueStmt } from "./TirContinueStmt";
import { TirExportStarStmt } from "./TirExportStarStmt";
import { TirExportStmt } from "./TirExportStmt";
import { TirFailStmt } from "./TirFailStmt";
import { TirForOfStmt } from "./TirForOfStmt";
import { TirForStmt } from "./TirForStmt";
import { TirFuncDecl, TirSimpleFuncParam } from "./TirFuncDecl";
import { TirIfStmt } from "./TirIfStmt";
import { TirImportStmt } from "./TirImportStmt";
import { TirMatchStmt } from "./TirMatchStmt";
import { TirReturnStmt } from "./TirReturnStmt";
import { TirTestStmt } from "./TirTestStmt";
import { TirSimpleVarDecl } from "./TirVarDecl/TirSimpleVarDecl";
import { TirWhileStmt } from "./TirWhileStmt";
import { TirExprStmt } from "./TirExprStmt";

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
    | TirExportStarStmt
    | TirExportStmt
    | TirImportStmt
    | TirAssignmentStmt
    | TirExprStmt
    ;

export function isTirStmt( thing: any ): thing is TirStmt
{
    return isObject( thing ) && (
        thing instanceof TirIfStmt
        || isTirVarDecl( thing)
        || thing instanceof TirFuncDecl
        || thing instanceof TirSimpleFuncParam
        || thing instanceof TirForStmt
        || thing instanceof TirForOfStmt
        || thing instanceof TirWhileStmt
        || thing instanceof TirReturnStmt
        || thing instanceof TirBlockStmt
        || thing instanceof TirBreakStmt
        || thing instanceof TirContinueStmt
        || thing instanceof TirFailStmt
        || thing instanceof TirAssertStmt
        || thing instanceof TirTestStmt
        || thing instanceof TirMatchStmt
        || thing instanceof TirExportStarStmt
        || thing instanceof TirExportStarStmt
        || thing instanceof TirExportStmt
        || thing instanceof TirImportStmt
        || thing instanceof TirAssignmentStmt
        || thing instanceof TirExprStmt
    );
}

export type TirVarDecl
    = TirSimpleVarDecl
    // | TirNamedDeconstructVarDecl
    // | TirSingleDeconstructVarDecl
    // | TirArrayLikeDeconstr
    ;

export function isTirVarDecl( thing: any ): thing is TirVarDecl
{
    return isObject( thing ) && (
              thing instanceof TirSimpleVarDecl
          // || thing instanceof TirNamedDeconstructVarDecl
          // || thing instanceof TirSingleDeconstructVarDecl
          // || thing instanceof TirArrayLikeDeconstr
    );
}