import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { AssignmentStmt } from "./AssignmentStmt";
import { PebbleStmt } from "./PebbleStmt";
import { VarStmt } from "./VarStmt";

/**
 * ***NOT*** for...of loop
 * 
 * for( init; condition; update ) body
 */
export class ForStmt
    implements HasSourceRange
{
    constructor(
        readonly init: VarStmt | undefined,
        readonly condition: PebbleExpr | undefined,
        readonly updates: AssignmentStmt[],
        readonly body: PebbleStmt,
        readonly range: SourceRange,
    ) {}
}