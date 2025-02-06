import { SourceRange } from "../../../Source/SourceRange";
import { HasSourceRange } from "../../HasSourceRange";
import { PebbleAstType } from "../../types/PebbleAstType";


export class TypeAliasDecl
    implements HasSourceRange
{
    constructor(
        readonly typeIdentifier: PebbleAstType,
        readonly aliasedType: PebbleAstType,
        readonly range: SourceRange,
    ) {}
}