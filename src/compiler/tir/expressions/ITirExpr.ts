import { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import { IRTerm } from "../../../IR";
import { TirType } from "../types/TirType";
import { ToIRTermCtx } from "./ToIRTermCtx";


export interface ITirExpr extends HasSourceRange {
    readonly type: TirType;
    readonly isConstant: boolean;
    deps: () => string[];
    toIR: ( ctx: ToIRTermCtx ) => IRTerm;
    clone: () => ITirExpr;
}