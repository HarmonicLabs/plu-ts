import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleType } from "../../types/PebbleType";


export class TypeAliasDecl
    implements HasSourceRange
{
    constructor(
        readonly typeIdentifier: PebbleType,
        readonly aliasedType: PebbleType,
        readonly range: SourceRange,
    ) {}
}