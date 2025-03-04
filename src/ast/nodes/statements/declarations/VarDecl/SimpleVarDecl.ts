import { CommonFlags } from "../../../../../common";
import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { AstTypeExpr } from "../../../types/AstTypeExpr";
import { HasInitExpr } from "./HasInit";

export class SimpleVarDecl
    implements HasSourceRange, HasInitExpr
{
    constructor(
        readonly name: Identifier,
        public type: AstTypeExpr | undefined,
        readonly initExpr: PebbleExpr | undefined,
        public flags: CommonFlags,
        readonly range: SourceRange,
    ) {}

    isConst(): boolean
    {
        return (this.flags & CommonFlags.Const) !== 0;
    }

    static onlyIdentifier( identifier: Identifier, flags: CommonFlags ): SimpleVarDecl
    {
        return new SimpleVarDecl(
            identifier,
            undefined,
            undefined,
            flags,
            identifier.range
        );
    }
}