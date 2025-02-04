import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { PebbleType } from "../../../types/PebbleType";
import { HasInitExpr } from "./HasInit";

export class SimpleVarDecl
    implements HasSourceRange, HasInitExpr
{
    constructor(
        readonly name: Identifier,
        readonly type: PebbleType | undefined,
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