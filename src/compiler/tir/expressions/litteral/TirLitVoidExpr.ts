import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";
import { TirVoidT } from "../../types/TirNativeType";
import { ITirExpr } from "../ITirExpr";

export class TirLitVoidExpr implements ITirExpr
{
    readonly type: PebbleConcreteTypeSym = new PebbleConcreteTypeSym({
        name: "void",
        concreteType: new TirVoidT(),
    });
    constructor(
        readonly range: SourceRange
    ) {}
}