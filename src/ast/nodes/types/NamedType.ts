import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleAstType } from "./PebbleAstType";

export class NamedType implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly tyArgs: PebbleAstType[],
        readonly range: SourceRange
    ) {}
}