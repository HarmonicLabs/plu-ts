import { CommonFlags } from "../../../../../common";
import { SourceRange } from "../../../../Source/SourceRange";
import { Identifier } from "../../../common/Identifier";
import { PebbleExpr } from "../../../expr/PebbleExpr";
import { HasSourceRange } from "../../../HasSourceRange";
import { AstTypeExpr } from "../../../types/AstTypeExpr";
import { ISingleDeconstructVarDecl, SingleDeconstructVarDecl } from "./SingleDeconstructVarDecl";
import { VarDecl } from "./VarDecl";

export class NamedDeconstructVarDecl
    implements HasSourceRange, ISingleDeconstructVarDecl
{
    constructor(
        readonly name: Identifier,
        readonly fields: Map<string, VarDecl>,
        readonly rest: Identifier | undefined,
        readonly type: AstTypeExpr | undefined, // can be undefined when use ad function parameter
        readonly initExpr: PebbleExpr | undefined, // can be undefined when use ad function parameter
        public flags: CommonFlags,
        readonly range: SourceRange,
    ) {}

    static fromSingleDeconstruct(
        name: Identifier,
        unnamed: SingleDeconstructVarDecl,
        range: SourceRange | undefined = undefined
    ): NamedDeconstructVarDecl
    {
        range = range instanceof SourceRange ? range.clone() : SourceRange.join( name, unnamed );
        return new NamedDeconstructVarDecl(
            name,
            unnamed.fields,
            unnamed.rest,
            unnamed.type,
            unnamed.initExpr,
            unnamed.flags,
            range
        );
    }
}