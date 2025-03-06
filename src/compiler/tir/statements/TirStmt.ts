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
import { TirIfStmt } from "./TirIfStmt";
import { TirImportStmt } from "./TirImportStmt";
import { TirMatchStmt } from "./TirMatchStmt";
import { TirReturnStmt } from "./TirReturnStmt";
import { TirTestStmt } from "./TirTestStmt";
import { TirWhileStmt } from "./TirWhileStmt";
import { TirExprStmt } from "./TirExprStmt";
import { TirVarDecl, isTirVarDecl } from "./TirVarDecl/TirVarDecl";
import { TirFuncDecl } from "./TirFuncDecl";

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