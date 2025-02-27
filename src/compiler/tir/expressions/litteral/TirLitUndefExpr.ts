import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";

export class TirLitUndefExpr implements ITirExpr
{
    constructor(
        /** must be an optional */
        readonly type: PebbleConcreteTypeSym,
        readonly range: SourceRange
    ) {}
}