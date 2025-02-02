import { BlockStmt } from "./BlockStmt";
import { BreakStmt } from "./BreakStmt";
import { ContinueStmt } from "./ContinueStmt";
import { DoWhileStmt } from "./DoWhileStmt";
import { EmptyStmt } from "./EmptyStmt";
import { ForOfStmt } from "./ForOfStmt";
import { ForStmt } from "./ForStmt";
import { IfStmt } from "./IfStmt";
import { ReturnStmt } from "./ReturnStmt";
import { VarStmt } from "./VarStmt";
import { WhileStmt } from "./WhileStmt";

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
    );
}