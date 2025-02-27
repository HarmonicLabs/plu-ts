import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";
import { ITirExpr } from "../ITirExpr";
import { TirExpr } from "../TirExpr";

export class TirLitArrExpr
    implements ITirExpr
{
    constructor(
        readonly elems: TirExpr[],
        readonly range: SourceRange,
        readonly type: PebbleConcreteTypeSym
    ) {}
}