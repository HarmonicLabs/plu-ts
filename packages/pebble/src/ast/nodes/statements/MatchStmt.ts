import { SourceRange } from "../../Source/SourceRange";
import { VarDecl } from "./declarations/VarDecl/VarDecl";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BodyStmt } from "./PebbleStmt";
import { BlockStmt } from "./BlockStmt";

export class MatchStmt
    implements HasSourceRange
{
    constructor(
        public matchExpr: PebbleExpr,
        public cases: MatchStmtCase[],
        public elseCase: MatchStmtElseCase | undefined,
        readonly range: SourceRange,
    ) {}
}

export class MatchStmtCase
    implements HasSourceRange
{
    constructor(
        readonly pattern: VarDecl,
        public body: BodyStmt,
        readonly range: SourceRange,
    ) {}

    bodyBlockStmt(): BlockStmt {
        if( this.body instanceof BlockStmt )
            return this.body;
        return new BlockStmt( [ this.body ], this.body.range );
    }
}

export class MatchStmtElseCase
    implements HasSourceRange
{
    constructor(
        public body: BodyStmt,
        readonly range: SourceRange,
    ) {}

    bodyBlockStmt(): BlockStmt {
        if( this.body instanceof BlockStmt )
            return this.body;
        return new BlockStmt( [ this.body ], this.body.range );
    }
}