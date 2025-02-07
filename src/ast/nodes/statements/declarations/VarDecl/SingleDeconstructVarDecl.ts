import { CommonFlags } from "../../../../../common";
import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { PebbleAstType } from "../../../types/PebbleAstType";
import { HasInitExpr } from "./HasInit";
import { VarDecl } from "./VarDecl";

export interface ISingleDeconstructVarDecl extends HasInitExpr {
    fields: Map<string, VarDecl>;
    rest: Identifier | undefined;
    type: PebbleAstType | undefined; // could turn useful in generic types (even with one constr)
    initExpr: PebbleExpr | undefined; // can be undefined when use ad function parameter
}

export class SingleDeconstructVarDecl
    implements HasSourceRange, ISingleDeconstructVarDecl
{
    constructor(
        readonly fields: Map<string, VarDecl>,
        readonly rest: Identifier | undefined,
        readonly type: PebbleAstType | undefined,
        readonly initExpr: PebbleExpr | undefined,
        public flags: CommonFlags,
        readonly range: SourceRange
    ) {}
}