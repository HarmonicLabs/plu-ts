import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { PebbleConcreteTypeSym } from "../../AstCompiler/scope/symbols/PebbleSym";


export interface ITirExpr extends HasSourceRange {
    readonly type: PebbleConcreteTypeSym
}