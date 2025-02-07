import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { PebbleAstType } from "../../../types/PebbleAstType";
import { HasInitExpr } from "./HasInit";
import { VarDecl } from "./VarDecl";

export class ArrayLikeDeconstr
    implements HasSourceRange, HasInitExpr
{
    constructor(
        readonly elements: VarDecl[],
        readonly rest: Identifier | undefined,
        readonly type: PebbleAstType | undefined, // just for the type checker, ususally this is inferred
        readonly initExpr: PebbleExpr | undefined,
        public flags: number,
        readonly range: SourceRange,
    ) {}
}