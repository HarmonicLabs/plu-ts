import { SourceRange } from "../../Source/SourceRange";
import { LitStrExpr } from "../expr/litteral/LitStrExpr";
import { HasSourceRange } from "../HasSourceRange";


export class ExportStarStmt
    implements HasSourceRange
{
    constructor(
        readonly path: LitStrExpr,
        readonly range: SourceRange,
    ) {}
}