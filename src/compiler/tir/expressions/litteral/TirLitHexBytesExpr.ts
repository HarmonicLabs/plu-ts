import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";
import { TirBytesT } from "../../types/TirNativeType";

export class TirLitHexBytesExpr
    implements ITirExpr
{
    readonly type: PebbleConcreteTypeSym = new PebbleConcreteTypeSym({
        name: "bytes",
        concreteType: new TirBytesT(),
    });
    constructor(
        readonly bytes: Uint8Array,
        readonly range: SourceRange
    ) {}
}