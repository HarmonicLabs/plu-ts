import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { PebbleExpr } from "../expr/PebbleExpr";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleType } from "../types/PebbleType";
import { HasInitExpr } from "./HasInit";
import { VarDecl } from "./VarDecl";

export interface ISingleDeconstructVarDecl extends HasInitExpr {
    fields: Map<string, VarDecl>;
    rest: Identifier | undefined;
    type: PebbleType | undefined; // could turn useful in generic types (even with one constr)
    initExpr: PebbleExpr | undefined; // can be undefined when use ad function parameter
}

export class SingleDeconstructVarDecl
    implements HasSourceRange, ISingleDeconstructVarDecl
{
    constructor(
        readonly fields: Map<string, VarDecl>,
        readonly rest: Identifier | undefined,
        readonly type: PebbleType | undefined,
        readonly initExpr: PebbleExpr | undefined,
        readonly range: SourceRange
    ) {}
}