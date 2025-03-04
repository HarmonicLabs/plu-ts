import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirType } from "../../types/TirType";

export class TirLitUndefExpr implements ITirExpr
{
    constructor(
        /** must be an optional */
        readonly type: TirType,
        readonly range: SourceRange
    ) {}
}