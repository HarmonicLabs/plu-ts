import { CommonFlags } from "../../../../../common";
import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { PebbleAstType } from "../../../types/PebbleAstType";
import { HasInitExpr } from "./HasInit";

export class SimpleVarDecl
    implements HasSourceRange, HasInitExpr
{
    constructor(
        readonly name: Identifier,
        readonly type: PebbleAstType | undefined,
        readonly initExpr: PebbleExpr | undefined,
        public flags: CommonFlags,
        readonly range: SourceRange,
    ) {}

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