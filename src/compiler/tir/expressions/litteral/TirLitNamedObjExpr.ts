import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirLitObjExpr } from "./TirLitObjExpr";
import { PebbleConcreteTypeSym } from "../../../AstCompiler/scope/symbols/PebbleSym";

export class TirLitNamedObjExpr
    implements ITirExpr, ITirLitObjExpr
{
    constructor(
        readonly name: Identifier,
        readonly fieldNames: Identifier[],
        readonly values: TirExpr[],
        readonly type: PebbleConcreteTypeSym,
        readonly range: SourceRange
    ) {}
}