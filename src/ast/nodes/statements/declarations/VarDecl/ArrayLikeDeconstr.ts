import { CommonFlags } from "../../../../../common";
import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { AstTypeExpr } from "../../../types/AstTypeExpr";
import { HasInitExpr } from "./HasInit";
import { VarDecl } from "./VarDecl";

export class ArrayLikeDeconstr
    implements HasSourceRange, HasInitExpr
{
    constructor(
        readonly elements: VarDecl[],
        readonly rest: Identifier | undefined,
        public type: AstTypeExpr | undefined, // just for the type checker, or func params, usually this is inferred
        readonly initExpr: PebbleExpr | undefined,
        public flags: CommonFlags,
        readonly range: SourceRange,
    ) {}

    isConst() { return (this.flags & CommonFlags.Const) !== 0; }
}