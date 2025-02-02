import { SourceRange } from "../../Source/SourceRange";
import { Identifier } from "../common/Identifier";
import { HasSourceRange } from "../HasSourceRange";
import { PebbleType } from "./PebbleType";

export class NamedType implements HasSourceRange
{
    constructor(
        readonly name: Identifier,
        readonly tyArgs: PebbleType[],
        readonly range: SourceRange
    ) {}
}