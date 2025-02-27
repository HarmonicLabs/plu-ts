import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";

export interface ITirLitObjExpr {
    fieldNames: Identifier[];
    values: TirExpr[];
}

export class TirLitObjExpr
    implements ITirExpr, ITirLitObjExpr
{
    constructor(
        readonly fieldNames: Identifier[],
        readonly values: TirExpr[],
        readonly type: PebbleConcreteTypeSym,
        readonly range: SourceRange
    ) {}
}