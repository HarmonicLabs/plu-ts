import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirExpr } from "../expressions/TirExpr";
import { TirType } from "../types/TirType";
import { TirBlockStmt } from "./TirBlockStmt";


export class TirFuncDecl
    implements HasSourceRange
{
    constructor(
        readonly name: string,
        readonly params: TirSimpleFuncParam[],
        readonly returnType: TirType,
        readonly body: TirBlockStmt,
        readonly range: SourceRange,
    ) {}
}

export class TirSimpleFuncParam
    implements HasSourceRange
{
    constructor(
        readonly name: string,
        readonly type: TirType, // params MUST have a type, even with initExpr
        readonly initExpr: TirExpr | undefined, // optional initializer for params
        readonly range: SourceRange,
    ) {}
}