import { SourceRange } from "../../../ast/Source/SourceRange";
import { ResolveValueResult } from "../../AstCompiler/scope/Scope";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";

export class TirVariableAccessExpr
    implements ITirExpr
{
    get type(): TirType {
        return this.resolvedValue.variableInfos.type;
    }
    constructor(
        readonly resolvedValue: ResolveValueResult, 
        readonly range: SourceRange
    ) {}
}