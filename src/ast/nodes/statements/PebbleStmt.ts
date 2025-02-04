import { AssertStmt } from "./AssertStmt";
import { BlockStmt } from "./BlockStmt";
import { BreakStmt } from "./BreakStmt";
import { ContinueStmt } from "./ContinueStmt";
import { isPebbleDecl, PebbleDecl } from "./declarations/PebbleDecl";
import { DoWhileStmt } from "./DoWhileStmt";
import { EmptyStmt } from "./EmptyStmt";
import { TypeImplementsStmt } from "./TypeImplementsStmt";
import { ExportStarStmt } from "./ExportStarStmt";
import { ExportStmt } from "./ExportStmt";
import { FailStmt } from "./FailStmt";
import { ForOfStmt } from "./ForOfStmt";
import { ForStmt } from "./ForStmt";
import { IfStmt } from "./IfStmt";
import { ImportStarStmt } from "./ImportStarStmt";
import { ImportStmt } from "./ImportStmt";
import { MatchStmt } from "./MatchStmt";
import { ReturnStmt } from "./ReturnStmt";
import { TestStmt } from "./TestStmt";
import { VarStmt } from "./VarStmt";
import { WhileStmt } from "./WhileStmt";
import { AssignmentStmt, isAssignmentStmt } from "./AssignmentStmt";

/**
 * An expression is a piece of code
 * that evaluates to a value,
 * 
 * while a statement is an instruction
 * that performs an action but 
 * does not return a value.
 * 
 * in some sense, a statement
 * is the only thing that can do side effects
 * (at least in pebble)
 */
export type PebbleStmt
    = IfStmt
    | VarStmt
    | ForStmt
    | ForOfStmt
    | WhileStmt
    | DoWhileStmt
    | ReturnStmt
    | BlockStmt
    | BreakStmt
    | ContinueStmt
    | EmptyStmt
    | FailStmt
    | AssertStmt
    | TestStmt
    | MatchStmt
    | PebbleDecl
    | ExportStarStmt
    | ImportStarStmt
    | ExportStmt
    | ImportStmt
    | TypeImplementsStmt
    | AssignmentStmt
    ;


export function isPebbleStmt( stmt: any ): stmt is PebbleStmt
{
    return (
           stmt instanceof IfStmt
        || stmt instanceof VarStmt
        || stmt instanceof ForStmt
        || stmt instanceof ForOfStmt
        || stmt instanceof WhileStmt
        || stmt instanceof DoWhileStmt
        || stmt instanceof ReturnStmt
        || stmt instanceof BlockStmt
        || stmt instanceof BreakStmt
        || stmt instanceof ContinueStmt
        || stmt instanceof EmptyStmt
        || stmt instanceof FailStmt
        || stmt instanceof AssertStmt
        || stmt instanceof TestStmt
        || stmt instanceof MatchStmt
        || isPebbleDecl( stmt )
        || stmt instanceof ExportStarStmt
        || stmt instanceof ImportStarStmt
        || stmt instanceof ExportStmt
        || stmt instanceof ImportStmt
        || stmt instanceof TypeImplementsStmt
        || isAssignmentStmt( stmt )
    );
}