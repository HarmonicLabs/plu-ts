import { AssertStmt } from "./AssertStmt";
import { BlockStmt } from "./BlockStmt";
import { BreakStmt } from "./BreakStmt";
import { ContinueStmt } from "./ContinueStmt";
import { DoWhileStmt } from "./DoWhileStmt";
import { EmptyStmt } from "./EmptyStmt";
import { FailStmt } from "./FailStmt";
import { ForOfStmt } from "./ForOfStmt";
import { ForStmt } from "./ForStmt";
import { IfStmt } from "./IfStmt";
import { MatchStmt } from "./MatchStmt";
import { ReturnStmt } from "./ReturnStmt";
import { TestStmt } from "./TestStmt";
import { VarStmt } from "./VarStmt";
import { WhileStmt } from "./WhileStmt";

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
    );
}