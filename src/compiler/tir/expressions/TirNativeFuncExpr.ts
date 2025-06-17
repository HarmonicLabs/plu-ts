import { SourceRange } from "../../../ast/Source/SourceRange";
import { bytes_t, data_t, int_t } from "../program/stdScope/stdScope";
import { TirFuncT, TirLinearMapT, TirListT, TirPairDataT, TirUnConstrDataResultT } from "../types/TirNativeType";
import { TirType } from "../types/TirType";
import { ITirExpr } from "./ITirExpr";

export enum TirNativeFuncExprKind {
    unConstrData, // data => TirUnConstrDataResultT
    unMapData,
    unListData,
    unBytesData,
    unIntData,

    constrData, // int => List<data> => data
    mapData, // LinearMap<data> => data
    listData, // List<data> => data

    unConstrDataResultIndex, // TirUnConstrDataResultT => int
    unConstrDataResultFields, // TirUnConstrDataResultT => List<data>
    rawFields, // data => List<data>

    pairDataFst, // pairData => data
    pairDataSnd, // pairData => data

    constrRawFields, // unConstrData => nativePairSndAsIs

    dropList
}
Object.freeze( TirNativeFuncExprKind );

export class TirNativeFuncExpr
    implements ITirExpr
{
    constructor(
        readonly kind: TirNativeFuncExprKind,
        readonly type: TirFuncT,
        public range: SourceRange = SourceRange.mock
    ) {}

    deps(): string[] { return []; }

    static dropListOf( t: TirType ): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.dropList,
            new TirFuncT([ int_t, new TirListT( t ) ], new TirListT( t ) )
        );
    }

    static get unConstrData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unConstrData,
            new TirFuncT([ data_t ], new TirUnConstrDataResultT() )
        );
    }
    static get unMapData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unMapData,
            new TirFuncT([ data_t ], new TirLinearMapT( data_t, data_t ) )
        );
    }
    static get unListData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unListData,
            new TirFuncT([ data_t ], new TirListT( data_t ) )
        );
    }
    static get unBytesData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unBytesData,
            new TirFuncT([ data_t ], bytes_t )
        );
    }
    static get unIntData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unIntData,
            new TirFuncT([ data_t ], int_t )
        );
    }

    static get constrData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.constrData,
            new TirFuncT([ int_t, new TirListT( data_t ) ], data_t )
        );
    }
    static get mapData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.mapData,
            new TirFuncT([ new TirLinearMapT( data_t, data_t ) ], data_t )
        );
    }
    static get listData(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.listData,
            new TirFuncT([ new TirListT( data_t ) ], data_t )
        );
    }

    static get unConstrDataResultIndex(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unConstrDataResultIndex,
            new TirFuncT([ new TirUnConstrDataResultT() ], int_t )
        );
    }
    static get unConstrDataResultFields(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.unConstrDataResultFields,
            new TirFuncT([ new TirUnConstrDataResultT() ], new TirListT( data_t ) )
        );
    }
    static get rawFields(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.rawFields,
            new TirFuncT([ data_t ], new TirListT( data_t ) )
        );
    }

    static get pairDataFst(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.pairDataFst,
            new TirFuncT([ new TirPairDataT ], data_t )
        );
    }
    static get pairDataSnd(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.pairDataSnd,
            new TirFuncT([ new TirPairDataT ], data_t )
        );
    }

    static get constrRawFields(): TirNativeFuncExpr {
        return new TirNativeFuncExpr(
            TirNativeFuncExprKind.constrRawFields,
            new TirFuncT([ data_t ], new TirPairDataT() )
        );
    }
}