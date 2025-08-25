import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirUnaryExpression } from "./ITirUnaryExpression";
import { TirType } from "../../types/TirType";
import { _ir_apps } from "../../../../IR/tree_utils/_ir_apps";
import { IRNative, IRTerm } from "../../../../IR";
import { ToIRTermCtx } from "../ToIRTermCtx";

export class TirUnaryTilde
    implements ITirExpr, ITirUnaryExpression
{
    constructor(
        public operand: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return this.operand.deps();
    }

    get isConstant(): boolean { return this.operand.isConstant; }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return _ir_apps(
            IRNative.complementByteString,
            this.operand.toIR( ctx )
        );
    }
}