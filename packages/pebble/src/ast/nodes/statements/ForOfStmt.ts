import { PebbleAst } from "../../PebbleAst";
import { SourceRange } from "../../Source/SourceRange";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { BlockStmt } from "./BlockStmt";
import { VarDecl } from "./declarations/VarDecl/VarDecl";
import { VarStmt } from "./VarStmt";

/**
 * for( `elemDeclaration` of iterable ) body
 */
export class ForOfStmt
    implements HasSourceRange
{
    constructor(
        readonly elemDeclaration: VarStmt<[VarDecl]>,
        public iterable: PebbleExpr,
        public body: PebbleAst,
        readonly range: SourceRange,
    ) {}

    bodyBlock(): BlockStmt
    {
        if( this.body instanceof BlockStmt )
            return this.body;
        return new BlockStmt( [ this.body ], this.body.range );
    }
}