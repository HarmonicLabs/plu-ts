import { Identifier } from "../../common/Identifier";
import { HasSourceRange } from "../../HasSourceRange";
import { SourceRange } from "../../../Source/SourceRange";
import { BlockStmt } from "../BlockStmt";

export class ContractDecl 
    implements HasSourceRange
{
    readonly name: Identifier;
    readonly body: BlockStmt;
    readonly range: SourceRange;

    constructor(
        name: Identifier,
        body: BlockStmt,
        range: SourceRange
    )
    {
        this.name = name;
        this.body = body;
        this.range = range;
    }
}
