import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BlockStmt } from "./BlockStmt";
import { BodyStmt } from "./PebbleStmt";

export class IfStmt
    implements HasSourceRange
{
    constructor(
        public condition: PebbleExpr,
        public thenBranch: BodyStmt,
        public elseBranch: BodyStmt | undefined,
        readonly range: SourceRange,
    ) {}

    thenBranchBlock(): BlockStmt
    {
        if( this.thenBranch instanceof BlockStmt )
            return this.thenBranch;
        return new BlockStmt( [ this.thenBranch ], this.thenBranch.range );
    }

    elseBranchBlock(): BlockStmt | undefined
    {
        if( !this.elseBranch ) return undefined;
        if( this.elseBranch instanceof BlockStmt )
            return this.elseBranch;
        return new BlockStmt( [ this.elseBranch ], this.elseBranch.range );
    }
}