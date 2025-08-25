import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRError, IRNative, IRTerm } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { TirExpr } from "../expressions/TirExpr";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirFailExpr
    implements ITirExpr
{
    constructor(
        /** must be string (or utf8 bytes) */
        public failMsgExpr: TirExpr | undefined,
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.failMsgExpr?.deps() ?? []
    }

    get isConstant(): boolean { return true; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const err = new IRError();
        if( !this.failMsgExpr ) return err;

        return _ir_apps(
            IRNative.trace,
            this.failMsgExpr.toIR( ctx ),
            err
        );
    }
}