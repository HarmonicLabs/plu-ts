import { CommonFlags } from "../../../../../common";
import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { AstTypeExpr } from "../../../types/AstTypeExpr";
import { HasInitExpr } from "./HasInit";
import { VarDecl } from "./VarDecl";

export interface ISingleDeconstructVarDecl extends HasInitExpr {
    fields: Map<Identifier, VarDecl>;
    rest: Identifier | undefined;
    // it might turn useful in generic types
    // (eg. `const Some{ value }: Optional<int> = ... )
    type: AstTypeExpr | undefined;
    initExpr: PebbleExpr | undefined; // can be undefined when use ad function parameter
}

export class SingleDeconstructVarDecl
    implements HasSourceRange, ISingleDeconstructVarDecl
{
    constructor(
        readonly fields: Map<Identifier, VarDecl>,
        readonly rest: Identifier | undefined,
        public type: AstTypeExpr | undefined,
        readonly initExpr: PebbleExpr | undefined,
        public flags: CommonFlags,
        readonly range: SourceRange
    ) {}

    isConst(): boolean
    {
        return (this.flags & CommonFlags.Const) !== 0;
    }
}