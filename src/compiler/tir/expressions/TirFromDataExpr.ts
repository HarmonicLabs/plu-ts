import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRNative, IRTerm } from "../../../IR";
import { IRNativeTag } from "../../../IR/IRNodes/IRNative/IRNativeTag";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { data_t } from "../program/stdScope/stdScope";
import { TirBytesT, TirDataOptT, TirDataT, TirFuncT, TirIntT, TirLinearMapT, TirListT } from "../types/TirNativeType";
import { TirDataStructType } from "../types/TirStructType";
import { TirType } from "../types/TirType";
import { canAssignTo } from "../types/utils/canAssignTo";
import { canCastToData } from "../types/utils/canCastTo";
import { getListTypeArg } from "../types/utils/getListTypeArg";
import { getUnaliased } from "../types/utils/getUnaliased";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { TirFuncExpr } from "./TirFuncExpr";
import { TirNativeFunc } from "./TirNativeFunc";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirFromDataExpr
    implements ITirExpr
{
    constructor(
        public dataExpr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    get isConstant(): boolean { return this.dataExpr.isConstant; }

    deps(): string[]
    {
        return this.dataExpr.deps();
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const expr_t = getUnaliased( this.dataExpr.type );
        const to_t = getUnaliased( this.type );

        if(
            // target type is data-encoded
            to_t instanceof TirDataStructType
            || to_t instanceof TirDataOptT
            || to_t instanceof TirDataT
            // or expr type is already correct
            || canAssignTo( expr_t, to_t )
        ) return this.dataExpr.toIR( ctx );

        if( !canCastToData( expr_t ) )
        throw new Error(
            `TirFromDataExpr: cannot convert from type ${expr_t.toString()} `+
            `to Data; nor to target type ${to_t.toString()}`
        );

        if( to_t instanceof TirLinearMapT )
        return _ir_apps(
            // linear maps only have pairs as elements
            // and we only support pairs of data (bc we only have `mkPairData`)
            IRNative.unMapData,
            this.dataExpr.toIR( ctx )
        );

        if( to_t instanceof TirListT )
        {
            const elems_t = getUnaliased( getListTypeArg( to_t )! );

            const listOfDataExpr =  _ir_apps(
                IRNative.unListData,
                this.dataExpr.toIR( ctx )
            );
            
            if( elems_t instanceof TirDataStructType
                || elems_t instanceof TirDataOptT
                || elems_t instanceof TirDataT
            ) return listOfDataExpr;

            return _ir_apps(
                IRNative._mapList,
                _fromData( elems_t ).toIR( ctx ),
                listOfDataExpr
            );
        }

        return _ir_apps(
            _fromData( to_t ).toIR( ctx ),
            this.dataExpr.toIR( ctx )
        );
    }

    toString(): string
    {
        return `fromData(${this.dataExpr.toString()}) as ${this.type.toString()}`;
    }

    clone(): TirFromDataExpr
    {
        return new TirFromDataExpr(
            this.dataExpr.clone(),
            this.type,
            this.range
        );
    }
}

function _fromData( _target_t: TirType ): TirExpr
{
    const target_t = getUnaliased( _target_t );

    if(
        target_t instanceof TirDataT
        || target_t instanceof TirDataOptT
        || target_t instanceof TirDataStructType
    ) return new TirNativeFunc(
        IRNativeTag._id,
        new TirFuncT([ data_t ], target_t)
    );

    if( target_t instanceof TirIntT ) return TirNativeFunc.unIData;
    if( target_t instanceof TirBytesT ) return TirNativeFunc.unBData;
    if( target_t instanceof  ) return TirNativeFunc.unBData;

}