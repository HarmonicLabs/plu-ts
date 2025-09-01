import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirUnaryExpression } from "./ITirUnaryExpression";
import { TirType } from "../../types/TirType";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { IRNative, IRTerm } from "../../../../IR";
import { _ir_apps } from "../../../../IR/tree_utils/_ir_apps";

export class TirUnaryMinus
    implements ITirExpr, ITirUnaryExpression
{
    constructor(
        public operand: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    clone(): TirUnaryMinus
    {
        return new TirUnaryMinus(
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
            IRNative._negateInt,
            this.operand.toIR( ctx )
        );
    }
}