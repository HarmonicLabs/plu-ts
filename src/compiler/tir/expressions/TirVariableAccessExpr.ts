import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";

export class TirVariableAccessExpr
    implements ITirExpr
{
    constructor(
        readonly name: string,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}