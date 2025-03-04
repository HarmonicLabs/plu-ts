import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirLitObjExpr } from "./TirLitObjExpr";
import { TirType } from "../../types/TirType";

export class TirLitNamedObjExpr
    implements ITirExpr, ITirLitObjExpr
{
    constructor(
        readonly name: Identifier,
        readonly fieldNames: Identifier[],
        readonly values: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}