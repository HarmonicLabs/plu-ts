import { CommonFlags } from "../../../../common";
import { SourceRange } from "../../../Source/SourceRange";
import { Identifier } from "../../common/Identifier";
import { PebbleExpr } from "../../expr/PebbleExpr";
import { HasSourceRange } from "../../HasSourceRange";

export class EnumDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly members: EnumValueDecl[],
        readonly range: SourceRange,
    ) {}
}

export class EnumValueDecl
    implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly flags: CommonFlags,
        readonly value: PebbleExpr | undefined,
        readonly range: SourceRange,
    ) {}
}