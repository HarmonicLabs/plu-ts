import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleType } from "../types/PebbleType";
import { HasInitExpr } from "./HasInit";
import { VarDecl } from "./VarDecl";

export class ArrayLikeDeconstr
    implements HasSourceRange, HasInitExpr
{
    constructor(
        readonly elements: VarDecl[],
        readonly rest: Identifier | undefined,
        readonly type: PebbleType | undefined, // just for the type checker, ususally this is inferred
        readonly initExpr: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}