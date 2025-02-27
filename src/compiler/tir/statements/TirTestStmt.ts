import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirBlockStmt } from "./TirBlockStmt";

export class TirTestStmt
    implements HasSourceRange
{
    constructor(
        readonly testName: string | undefined,
        readonly body: TirBlockStmt,
        readonly range: SourceRange,
    ) {}
}