import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirStmt } from "./TirStmt";

export class TirBlockStmt
    implements HasSourceRange
{
    constructor(
        readonly stmts: TirStmt[],
        readonly range: SourceRange
    ) {}
}