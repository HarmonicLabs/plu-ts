import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { AssignmentStmt } from "./AssignmentStmt";
import { BlockStmt } from "./BlockStmt";
import { BodyStmt } from "./PebbleStmt";
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
        public init: VarStmt | undefined,
        public condition: PebbleExpr | undefined,
        public updates: AssignmentStmt[],
        public body: BodyStmt,
        readonly range: SourceRange,
    ) {}

    bodyBlock(): BlockStmt
    {
        if( this.body instanceof BlockStmt )
            return this.body;
        return new BlockStmt( [ this.body ], this.body.range );
    }
}