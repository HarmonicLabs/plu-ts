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
        readonly range: SourceRange,
    ) {}

    static onlyIdentifier( identifier: Identifier )
    {
        return new SimpleVarDecl(
            identifier,
            undefined,
            undefined,
            identifier.range
        );
    }
}