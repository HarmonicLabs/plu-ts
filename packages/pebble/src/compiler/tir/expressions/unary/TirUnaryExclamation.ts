import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirUnaryExpression } from "./ITirUnaryExpression";
import { TirType } from "../../types/TirType";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { _ir_apps } from "../../../../IR/IRNodes/IRApp";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import type { IRTerm } from "../../../../IR/IRTerm";

export class TirUnaryExclamation
    implements ITirExpr, ITirUnaryExpression
{
    constructor(
        public operand: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    toString(): string
    {
        return `!${this.operand.toString()}`;
    }

    /// @ts-ignore Return type annotation circularly references itself
    clone(): TirUnaryExclamation
    {
        return new TirUnaryExclamation(
            this.operand.clone(),
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[]
    {
        return this.operand.deps();
    }

    get isConstant(): boolean { return this.operand.isConstant; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return _ir_apps(
            IRNative._not,
            this.operand.toIR( ctx )
        );
    }
}