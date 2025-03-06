import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirFuncExpr } from "../expressions/TirFuncExpr";
import { TirType } from "../types/TirType";
import { TirBlockStmt } from "./TirBlockStmt";


export class TirFuncDecl
    implements HasSourceRange
{
    get range(): SourceRange
    {
        return this.expr.range;
    }
    
    constructor(
        readonly expr: TirFuncExpr,
    ) {}

    isGeneric(): boolean
    {
        return this.expr.isGeneric();
    }

    isAnonymous(): boolean
    {
        return this.expr.isAnonymous();
    }
}