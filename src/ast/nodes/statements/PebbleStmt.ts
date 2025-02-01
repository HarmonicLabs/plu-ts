import { DoWhileStmt } from "./DoWhileStmt";
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
    | ReturnStmt;


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
    );
}