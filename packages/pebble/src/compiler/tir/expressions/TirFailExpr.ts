import { SourceRange } from "../../../ast/Source/SourceRange";
import { _ir_apps } from "../../../IR/IRNodes/IRApp";
import { IRError } from "../../../IR/IRNodes/IRError";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import type { IRTerm } from "../../../IR/IRTerm";
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

    toString(): string
    {
        return `(fail${this.failMsgExpr ? ` ${this.failMsgExpr.toString()}` : ""})`;
    }
    pretty( indent: number ): string
    {
        const singleIndent = "  ";
        const indent_base = singleIndent.repeat(indent);
        return `(fail${this.failMsgExpr ? ` ${this.failMsgExpr.pretty(indent)}` : ""})`;
    }

    clone(): TirExpr
    {
        return new TirFailExpr(
            this.failMsgExpr?.clone() as any,
            this.type.clone(),
            this.range.clone()
        );
    }

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