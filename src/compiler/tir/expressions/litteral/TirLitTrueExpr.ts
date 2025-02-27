import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";
import { TirBoolT } from "../../types/TirNativeType";

export class TirLitTrueExpr implements ITirExpr
{
    readonly type: PebbleConcreteTypeSym = new PebbleConcreteTypeSym({
        name: "boolean",
        concreteType: new TirBoolT(),
    });
    constructor(
        readonly range: SourceRange
    ) {}
}