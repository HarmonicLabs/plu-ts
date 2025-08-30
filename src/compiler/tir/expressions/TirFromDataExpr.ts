import { SourceRange } from "../../../ast/Source/SourceRange";
import { IRApp, IRConst, IRConstr, IRDelayed, IRForced, IRFunc, IRHoisted, IRNative, IRTerm, IRVar } from "../../../IR";
import { _ir_apps } from "../../../IR/tree_utils/_ir_apps";
import { _ir_let } from "../../../IR/tree_utils/_ir_let";
import { TirBoolT } from "../types/TirNativeType/native/bool";
import { TirBytesT } from "../types/TirNativeType/native/bytes";
import { TirDataT } from "../types/TirNativeType/native/data";
import { TirIntT } from "../types/TirNativeType/native/int";
import { TirLinearMapT } from "../types/TirNativeType/native/linearMap";
import { TirListT } from "../types/TirNativeType/native/list";
import { TirDataOptT } from "../types/TirNativeType/native/Optional/data";
import { TirSopOptT } from "../types/TirNativeType/native/Optional/sop";
import { TirStringT } from "../types/TirNativeType/native/string";
import { TirVoidT } from "../types/TirNativeType/native/void";
import { TirDataStructType, TirSoPStructType } from "../types/TirStructType";
import { isTirType, TirType } from "../types/TirType";
import { getListTypeArg } from "../types/utils/getListTypeArg";
import { getOptTypeArg } from "../types/utils/getOptTypeArg";
import { getUnaliased } from "../types/utils/getUnaliased";
import { ITirExpr } from "./ITirExpr";
import { TirExpr } from "./TirExpr";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirFromDataExpr
    implements ITirExpr
{
    constructor(
        public dataExpr: TirExpr,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    clone(): TirFromDataExpr
    {
        return new TirFromDataExpr(
            this.dataExpr.clone(),
            this.type.clone(),
            this.range.clone()
        );
    }

    get isConstant(): boolean { return this.dataExpr.isConstant; }

    deps(): string[]
    {
        return this.dataExpr.deps();
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        return _inlineFromData(
            this.type,
            this.dataExpr.toIR( ctx )
        );
    }

    toString(): string
    {
        return `fromData(${this.dataExpr.toString()}) as ${this.type.toString()}`;
    }

}

export function _inlineFromData(
    target_t: TirType,
    dataExprIR: IRTerm,
): IRTerm
{
    const to_t = getUnaliased( target_t );

    if(
        // target type is data-encoded
        to_t instanceof TirDataStructType
        || to_t instanceof TirDataOptT
        || to_t instanceof TirDataT
    ) return dataExprIR;

    if( to_t instanceof TirLinearMapT )
    return _ir_apps(
        // linear maps only have pairs as elements
        // and we only support pairs of data (bc we only have `mkPairData`)
        IRNative.unMapData,
        dataExprIR
    );

    if( to_t instanceof TirListT )
    {
        const elems_t = getUnaliased( getListTypeArg( to_t )! );

        const listOfDataExpr =  _ir_apps(
            IRNative.unListData,
            dataExprIR
        );
        
        if( elems_t instanceof TirDataStructType
            || elems_t instanceof TirDataOptT
            || elems_t instanceof TirDataT
        ) return listOfDataExpr;

        return _ir_apps(
            IRNative._mkMapList,
            IRConst.listOf( elems_t )([]),
            _fromDataUplcFunc( elems_t ),
            listOfDataExpr
        );
    }

    if( to_t instanceof TirSopOptT )
    {
        const value_t = getOptTypeArg( to_t );
        if( !isTirType( value_t ) ) throw new Error("TirFromDataExpr: unreachable");

        return _ir_let( // introuduce a var
            _ir_apps(
                IRNative.unConstrData,
                dataExprIR
            ),
            _ir_apps(
                IRNative.strictIfThenElse,
                _ir_apps(
                    IRNative.equalsInteger,
                    _ir_apps(
                        IRNative.fstPair,
                        new IRVar( 0 ) // unConstrData result
                    ),
                    IRConst.int( 0 )
                ),
                // then (Just value)
                new IRConstr( 0, [
                    _ir_apps(
                        _fromDataUplcFunc( value_t ),
                        _ir_apps(
                            IRNative.headList,
                            _ir_apps(
                                IRNative.sndPair,
                                new IRVar( 0 ) // unConstrData result
                            )
                        )
                    )
                ]),
                // else (Nothing)
                new IRHoisted( new IRConstr( 1, [] ) )
            )
        );
    }

    if( to_t instanceof TirSoPStructType )
    {
        return _inlineMultiSopConstrFromData( to_t, dataExprIR );
    }

    return _ir_apps(
        _fromDataUplcFunc( to_t ),
        dataExprIR
    );
};

export function _fromDataUplcFunc(
    _target_t: TirType
): IRTerm
{
    const target_t = getUnaliased( _target_t );

    if(
        target_t instanceof TirDataT
        || target_t instanceof TirDataOptT
        || target_t instanceof TirDataStructType
    ) return IRNative._id;

    if( target_t instanceof TirIntT ) return IRNative.unIData;
    if( target_t instanceof TirBytesT ) return IRNative.unBData;
    if( target_t instanceof TirVoidT ) return _mkUnit;
    if( target_t instanceof TirBoolT ) return _boolFromData;
    if( target_t instanceof TirStringT ) return _strFromData;

    if( target_t instanceof TirLinearMapT )
    // linear maps only have pairs as elements
    // and we only support pairs of data (bc we only have `mkPairData`)
    return IRNative.unMapData;

    if( target_t instanceof TirListT )
    {
        const elems_t = getUnaliased( getListTypeArg( target_t )! );

        if( elems_t instanceof TirDataStructType
            || elems_t instanceof TirDataOptT
            || elems_t instanceof TirDataT
        ) return IRNative.unListData;

        return new IRHoisted( new IRFunc(
            1, // data ( representing list )
            _ir_apps(
                IRNative._mkMapList,
                IRConst.listOf( elems_t )([]),
                _fromDataUplcFunc( elems_t ),
                _ir_apps(
                    IRNative.unListData,
                    new IRVar( 0 ) // data
                )
            )
        ));
    }

    if(
        target_t instanceof TirSopOptT
        || target_t instanceof TirSoPStructType
    )
    {
        return new IRHoisted(
            new IRFunc(
                1, // data
                _inlineFromData(
                    target_t,
                    new IRVar( 0 ) // data
                )
            )
        );
    }

    throw new Error(
        `TirFromDataExpr: cannot convert from Data to type ${target_t.toString()}`
    );
}

const _mkUnit = new IRHoisted( new IRFunc( 1, IRConst.unit, "~_mkUnit") );

const _boolFromData = new IRHoisted( new IRFunc(
    1,
    _ir_apps(
        IRNative.equalsInteger,
        new IRApp(
            IRNative.fstPair,
            new IRApp(
                IRNative.unConstrData,
                new IRVar( 0 )
            )
        ),
        IRConst.int( 0 )
    )
));

const _strFromData = new IRHoisted( new IRFunc(
    1, // data
    _ir_apps(
        IRNative.decodeUtf8,
        _ir_apps(
            IRNative.unBData,
            new IRVar( 0 ) // data
        )
    )
));

export function _inilneSingeSopConstrFromData(
    sop_t: TirSoPStructType,
    dataExprIR: IRTerm
): IRTerm
{
    if( sop_t.constructors.length !== 1 )
    throw new Error("_inilneSingeSopConstrFromData: multiple constructors");

    const constr = sop_t.constructors[0];

    if( constr.fields.length === 0 )
    return new IRHoisted( new IRConstr( 0, [] ) );

    if( constr.fields.length === 1 ) {
        const value_t = getUnaliased( constr.fields[0].type );
        if( !isTirType( value_t ) ) throw new Error("TirFromDataExpr: unreachable");

        return new IRConstr( 0, [
            _inlineFromData(
                value_t,
                // get head of fields list
                _ir_apps(
                    IRNative.headList,
                    _ir_apps(
                        IRNative.sndPair,
                        _ir_apps(
                            IRNative.unConstrData,
                            dataExprIR
                        )
                    )
                )
            )
        ]);
    }

    return _ir_let(
        _ir_apps(
            IRNative.sndPair,
            _ir_apps(
                IRNative.unConstrData,
                dataExprIR
            )
        ), // introuduce fields list
        new IRConstr(
            0,
            constr.fields.map( (field, i) => {
                const field_t = getUnaliased( field.type );
                if( !isTirType( field_t ) ) throw new Error("TirFromDataExpr: unreachable");
    
                return _inlineFromData(
                    field_t,
                    _ir_apps(
                        IRNative.headList,
                        i === 0 ? new IRVar( 0 ) // fields list
                        :_ir_apps(
                            IRNative._dropList,
                            IRConst.int( i ),
                            new IRVar( 0 ) // fields list
                        )
                    )
                );
            } )
        )
    );
}

export function _inlineMultiSopConstrFromData(
    sop_t: TirSoPStructType,
    dataExprIR: IRTerm
): IRTerm
{
    if( sop_t.constructors.length <= 1 )
    return _inilneSingeSopConstrFromData( sop_t, dataExprIR );

    const continuations = sop_t.constructors.map((constr, constrIdx) =>
    {
        if( constr.fields.length === 0 )
        return new IRHoisted( new IRConstr( constrIdx, [] ) );
    
        if( constr.fields.length === 1 ) {
            const value_t = getUnaliased( constr.fields[0].type );
            if( !isTirType( value_t ) ) throw new Error("TirFromDataExpr: unreachable");
    
            return new IRConstr( constrIdx, [
                _inlineFromData(
                    value_t,
                    _ir_apps(
                        IRNative.headList,
                        new IRVar( 0 ) // fields list
                    )
                )
            ]);
        }
    
        return new IRConstr(
            constrIdx,
            constr.fields.map( (field, i) => {
                const field_t = getUnaliased( field.type );
                if( !isTirType( field_t ) ) throw new Error("TirFromDataExpr: unreachable");
    
                return _inlineFromData(
                    field_t,
                    _ir_apps(
                        IRNative.headList,
                        i === 0 ? new IRVar( 0 ) // fields list
                        : _ir_apps(
                            IRNative._dropList,
                            IRConst.int( i ),
                            new IRVar( 0 ) // fields list
                        )
                    )
                );
            } )
        );
    });

    let finalIfThenElseChain: IRTerm = continuations[ continuations.length - 1 ];
    for( let i = continuations.length - 2; i >= 0; i-- )
    {
        finalIfThenElseChain = new IRForced(_ir_apps(
            IRNative.strictIfThenElse,
            _ir_apps(
                new IRVar( 1 ), // isConstrIdx
                IRConst.int( i )
            ),
            new IRDelayed( continuations[i] ),
            new IRDelayed( finalIfThenElseChain )
        ));
    }

    return _ir_let(
        _ir_apps(
            IRNative.unConstrData,
            dataExprIR
        ), // unConstrData result
        _ir_let(
            _ir_apps(
                IRNative.equalsInteger,
                _ir_apps(
                    IRNative.fstPair,
                    new IRVar( 0 ) // unConstrData result
                )
            ), // isConstrIdx
            _ir_let(
                _ir_apps(
                    IRNative.sndPair,
                    new IRVar( 1 ), // unConstrData result
                ), // fields list
                finalIfThenElseChain
            )
        )
    );
}