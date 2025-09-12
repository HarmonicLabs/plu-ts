import { CommonFlags } from "../../../../common";
import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { BlockStmt } from "../../statements/BlockStmt";
import { FuncDecl } from "../../statements/declarations/FuncDecl";
import { ReturnStmt } from "../../statements/ReturnStmt";
import { AstFuncType } from "../../types/AstNativeTypeExpr";
import { PebbleExpr } from "../PebbleExpr";
import { ArrowKind } from "./ArrowKind";

/**
 * a litteral function value
**/
export class FuncExpr implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly flags: CommonFlags,
        readonly typeParams: Identifier[],
        readonly signature: AstFuncType,
        public body: BlockStmt | PebbleExpr,
        readonly arrowKind: ArrowKind,
        readonly range: SourceRange
    ) {}

    bodyBlockStmt(): BlockStmt
    {
        return (this.body instanceof BlockStmt ? this.body :
            new BlockStmt(
                [ new ReturnStmt( this.body, this.body.range ) ],
                this.body.range
            )
        );
    }
}