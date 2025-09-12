import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BlockStmt } from "./BlockStmt";
import { BodyStmt } from "./PebbleStmt";

export class WhileStmt
    implements HasSourceRange
{
    constructor(
        public condition: PebbleExpr,
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