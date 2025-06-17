import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRTerm } from "../../../IR";
import { TirAliasType } from "../types/TirAliasType";
import { TirDataOptT, TirDataT } from "../types/TirNativeType";
import { TirDataStructType } from "../types/TirStructType";
import { TirType } from "../types/TirType";
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
        /** resulting data-encoded type */
        readonly type: TirDataEncodedType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return this.expr.deps();
    }

    toIR(ctx: ToIRTermCtx): IRTerm;
    {
        
    }
}