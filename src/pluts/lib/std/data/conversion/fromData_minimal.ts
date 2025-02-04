import { PType } from "../../../../PType";
import { PByteString, PData, PLam, PString } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { PairT, PrimType, asData, bool, fn, isWellFormedType, lam, list, pair, tyVar, unit } from "../../../../../type_system";
import { TermType, bs, data, int, str } from "../../../../../type_system";
import { isTaggedAsAlias } from "../../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../../type_system/tyArgs/unwrapAlias";
import { phoist } from "../../../phoist";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { _papp, _pcompose, _plam } from "./minimal_common";
import { getElemsT, getFstT, getSndT } from "../../../../../type_system/tyArgs";
import { _pmap } from "../../list/pmap/minimal";
import { _punsafeConvertType } from "../../../punsafeConvertType/minimal";
import { IRNative } from "../../../../../IR/IRNodes/IRNative";
import { IRApp } from "../../../../../IR/IRNodes/IRApp";
import { IRFunc } from "../../../../../IR/IRNodes/IRFunc";
import { IRVar } from "../../../../../IR/IRNodes/IRVar";
import { IRConst } from "../../../../../IR/IRNodes/IRConst";
import { _ir_apps } from "../../../../../IR/tree_utils/_ir_apps";
import { phead, ptail } from "../../../builtins/list";


const pUnitFromData = phoist(
    new Term(
        lam( data, unit ),
        dbn => new IRFunc( 1, IRConst.unit )
    )
)

const pBoolFromData = phoist(
    new Term(
        lam( data, bool ),
        dbn => new IRFunc(
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
        )
    )
);

const punBData = new Term<PLam<PData, PByteString>>(
    lam( data, bs ),
    _dbn => IRNative.unBData
);

const punIData = new Term(
    lam( data, int ),
    _dbn => IRNative.unIData,
);

const pdecodeUtf8  =new Term<PLam<PByteString, PString>>(
    lam( bs, str ),
    _dbn => IRNative.decodeUtf8,
);

const punListData = new Term(
    lam( data, list( data ) ),
    _dbn => IRNative.unListData
);

const punMapData = new Term(
    lam( data, list( pair( data, data ) ) ) as any,
    _dbn => IRNative.unMapData
);

const ppairData = new Term(
    fn([ data, data ], pair( data, data ) ),
    _dbn => IRNative.mkPairData
)

const pStrFromData =
    phoist(
        _papp(
            _papp(
                _pcompose( data, bs, str ) as any,
                pdecodeUtf8,
            ) as any,
            punBData
        )
    );

const pPairFromData =
    phoist(
        _plam(
            data,
            pair( data, data )
        )
        ( assumedList =>
            _papp(
                _plam( list( data ), pair( data, data ) )
                ( listData =>
                    _papp(
                        _papp(
                            ppairData as any,
                            phead( data ).$( listData )
                        ) as any,
                        phead( data ).$(
                            ptail( data ).$( listData )
                        )
                    )
                ),
                _papp( punListData as any, assumedList ) as any
            )
        )
    );

/**
 * @deprecated use `_fromData` instead
 */
export const fromData_minimal = _fromData;

export function _fromData<T extends TermType>( t: T ): ( term: Term<PData> ) => Term<ToPType<T>>
{
    if( isTaggedAsAlias( t ) ) return (( term: any ) => {
        term = _fromData( unwrapAlias( t as any ) )( term );
        return new Term(
            t,
            term.toIR,
            Boolean(term.isConstant)
        ) as any;
    }) as any;

    // unwrap asData before `t extends data`
    if( t[0] === PrimType.AsData ) t = t[1] as T;
    
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) => {
            const theTerm = punsafeConvertType( term, t );
            (theTerm as any).isConstant = (term as any).isConstant;

            return theTerm;
        }) as any;

    function applyToTerm( termFunc: Term<any>, t?: TermType ): ( term: Term<PData> ) => Term<ToPType<T>>
    {
        return ( term ) => {
            let theTerm = _papp( termFunc, term ) as any
            theTerm = t !== undefined && isWellFormedType( t ) ? _punsafeConvertType( theTerm, t ) : theTerm;
            theTerm.isConstant = (term as any).isConstant;
            return theTerm;
        };
    }

    if(
        typeExtends(
            t, 
            list( 
                pair( 
                    data, 
                    data
                )
            )
        )
    ) return applyToTerm( punMapData, t );

    if(
        typeExtends(
            t, 
            list( 
                pair( 
                    tyVar(), 
                    tyVar()
                )
            )
        )
    )
    {
        const elemsT = getElemsT( t ) as PairT<TermType,TermType>;
        const fstT = getFstT( elemsT );
        const sndT = getSndT( elemsT );
        console.log( sndT, elemsT );
        return (
            ( term: Term<any> ) => {

                const theTerm = punsafeConvertType(
                    _papp(
                        punMapData as any,
                        term
                    ),
                    list(
                        pair(
                            asData( fstT ),
                            asData( sndT )
                        )
                    )
                );
                (theTerm as any).isConstant = (term as any).isConstant;
                return theTerm;
            }
        ) as any
    };
    
    if(
        typeExtends(
            t,
            list( data )
        )
    ) return applyToTerm( punListData );

    if(
        typeExtends(
            t, 
            list( 
                tyVar()
            )
        )
    )
    {
        const elemsT = getElemsT( t );
        return (
            ( term: Term<PData> ) => {

                const theTerm = 
                    _pmap( data, elemsT )
                    .$( _pfromData( elemsT ) )
                    .$(
                        _papp(
                            punListData as any,
                            term
                        ) as any
                    );

                (theTerm as any).isConstant = (term as any).isConstant;
                return theTerm;
            }
        ) as any
    };

    if(
        typeExtends(
            t, 
            pair( 
                tyVar(), // handles data to
                tyVar()
            )
        )
    )
    {
        const fstT = getFstT( t ) as TermType;
        const sndT = getSndT( t ) as TermType;
        return (( term: Term<PData> ) => {

            const theTerm = punsafeConvertType(
                _papp(
                    pPairFromData,
                    term
                ),
                pair(
                    asData( fstT ),
                    asData( sndT )
                )
            ) as any
            theTerm.isConstant = (term as any).isConstant;
            return theTerm;
        })
    };

    return applyToTerm( _pfromData( t ) );
}

function pid<T extends TermType, TT extends TermType>( fromT: T, toT: TT ): TermFn<[ ToPType<T> ], ToPType<TT>>
{
    return phoist(
        _plam( fromT, toT )( x => punsafeConvertType( x, toT ) )
    ) as any;
}

/**
 * @deprecated use `_pfromData` instead
 */
export const pfromData_minimal = _pfromData; 

export function _pfromData<T extends TermType>( t: T ): TermFn<[ PData ], ToPType<T> >
{
    if( isTaggedAsAlias( t ) ) return _pfromData( unwrapAlias( t as any ) ) as any;
    if( typeExtends( t, data ) ) 
        return pid( data, t );


    if( typeExtends( t, int ) )     return punIData as any;
    if( typeExtends( t, bs ) )      return punBData as any;
    if( typeExtends( t, str ) )     return pStrFromData as any;
    if( typeExtends( t, unit ) )    return pUnitFromData as any;
    if( typeExtends( t, bool ) )    return pBoolFromData as any;
    
    if(
        typeExtends(
            t, 
            list( 
                pair( 
                    data, 
                    data
                )
            )
        )
    ) return _punsafeConvertType( punMapData, lam( data, t ) ) as any;

    if(
        typeExtends(
            t, 
            list( 
                pair( 
                    tyVar(), 
                    tyVar()
                )
            )
        )
    )
    {
        const elemsT = getElemsT( t ) as PairT<TermType,TermType>;
        const fstT = getFstT( elemsT );
        const sndT = getSndT( elemsT );
        return punsafeConvertType(
            punMapData,
            lam(
                data,
                list(
                    pair(
                        asData( fstT ),
                        asData( sndT )
                    )
                )
            )
        ) as any
    };
    
    if(
        typeExtends(
            t,
            list( data )
        )
    ) return punListData as any;

    if(
        typeExtends(
            t, 
            list( 
                tyVar()
            )
        )
    )
    {
        const elemsT = getElemsT( t );
        return _papp(
            _papp(
                _pcompose( data, list( data ) , t ) as any,
                _pmap( data, elemsT ).$( _pfromData(elemsT) )
            ) as any ,
            punListData
        ) as any
    };

    if(
        typeExtends(
            t, 
            pair( 
                tyVar(), // handles data to
                tyVar()
            )
        )
    )
    {
        const fstT = getFstT( t ) as TermType;
        const sndT = getFstT( t ) as TermType;
        return punsafeConvertType(
            pPairFromData,
            lam(
                data,
                pair(
                    asData( fstT ),
                    asData( sndT )
                )
            )
        ) as any;
    };

    return _plam( data, t )( _fromData( t ) ) as any
}