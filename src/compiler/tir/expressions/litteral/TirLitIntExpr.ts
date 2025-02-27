import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";
import { TirIntT } from "../../types/TirNativeType";

export class TirLitIntExpr
    implements ITirExpr
{
    readonly type: PebbleConcreteTypeSym = new PebbleConcreteTypeSym({
        name: "int",
        concreteType: new TirIntT()
    });
    constructor(
        readonly integer: bigint,
        readonly range: SourceRange
    ) {}
}