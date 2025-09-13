import type { HasSourceRange } from "../../../ast/nodes/HasSourceRange";
import type { IRTerm } from "../../../IR/IRTerm";
import type { TirType } from "../types/TirType";
import type { ToIRTermCtx } from "./ToIRTermCtx";


export interface ITirExpr extends HasSourceRange {
    readonly type: TirType;
    readonly isConstant: boolean;
    deps: () => string[];
    toIR: ( ctx: ToIRTermCtx ) => IRTerm;
    clone: () => ITirExpr;
    toString: () => string;
}