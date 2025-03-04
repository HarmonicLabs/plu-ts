import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { TirType } from "../types/TirType";


export interface ITirExpr extends HasSourceRange {
    readonly type: TirType,
}