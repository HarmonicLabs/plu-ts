import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";

export class TirLitThisExpr implements ITirExpr
{
    constructor(
        readonly type: PebbleConcreteTypeSym,
        readonly range: SourceRange
    ) {}
}