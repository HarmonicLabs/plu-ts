import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { data_t, int_t } from "../program/stdScope/stdScope";
import { TirAliasType } from "../types/TirAliasType";
import { TirDataOptT, TirDataT } from "../types/TirNativeType";
import { TirDataStructType } from "../types/TirStructType";
import { isTirType, TirType } from "../types/TirType";
import { canAssignTo } from "../types/utils/canAssignTo";
import { getUnaliased } from "../types/utils/getUnaliased";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

type TirUnaliasedDataEncodedType = TirDataT | TirDataOptT | TirDataStructType;
export type TirDataEncodedType = TirUnaliasedDataEncodedType | TirAliasType<TirUnaliasedDataEncodedType>;

export function isTirDataEncodedType(
    type: TirType
): type is TirDataEncodedType
{
    type = getUnaliased( type ) ?? type;
    return (
        type instanceof TirDataT
        || type instanceof TirDataOptT
        || type instanceof TirDataStructType
    );
}

export class TirToDataExpr
    implements ITirExpr
{
    constructor(
        public expr: TirExpr,
        readonly range: SourceRange
    ) {}

    get isConstant(): boolean { return this.expr.isConstant; }
    get type(): TirDataT { return data_t; }

    deps(): string[]
    {
        return this.expr.deps();
    }

    toIR(ctx: ToIRTermCtx): IRTerm
    {
        const expr_t = this.expr.type;
        if( canAssignTo( expr_t, int_t ) ) return 
    }
}