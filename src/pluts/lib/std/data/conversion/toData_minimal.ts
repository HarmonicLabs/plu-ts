import { PAsData, PByteString, PData, PInt, PLam, PList, PPair, PString } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { TermType, bs, data, fn, int, str, PairT, asData, bool, lam, list, pair, tyVar, unit, PrimType } from "../../../../../type_system";
import { isTaggedAsAlias } from "../../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../../type_system/tyArgs/unwrapAlias";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolToData } from "../../bool/pBoolToData";
import { pData } from "../pData";
import { _papp, _pcompose } from "./minimal_common";
import { getElemsT, getFstT, getSndT } from "../../../../../type_system/tyArgs";
import { _punsafeConvertType } from "../../../punsafeConvertType/minimal";
import { IRNative } from "../../../../../IR/IRNodes/IRNative";
import { PType } from "../../../../PType";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { pList } from "../../list/const";
import { _pmap } from "../../list/pmap/minimal";
import { pfstPair, psndPair } from "../../../builtins/pair";

const pIntToData  =new Term<PLam<PInt, PAsData<PInt>>>(
    lam( int, asData( int ) ) as any,
    _dbn => IRNative.iData
);

const pBSToData = new Term<PLam<PByteString, PAsData<PByteString>>>(
    lam( bs, asData( bs ) ) as any,
    _dbn => IRNative.bData
);

const pencodeUtf8  =new Term<PLam<PString, PByteString>>(
    lam( str, bs ),
    _dbn => IRNative.encodeUtf8
);

const pStrToData: Term<PLam<PString, PAsData<PString>>> =
    phoist(
        _papp(
            _papp(
                _pcompose( str, bs, data ) as any,
                pBSToData
            ) as any,
            pencodeUtf8
        )
    );

const pUnitToData = phoist(
    plam( unit, asData( unit ) )
    ( _ => _punsafeConvertType( 
        pData( 
            new DataConstr(0,[])
        ), 
        asData( unit )
    ))
);

const pListToData = <ElT extends TermType>( elemsT: ElT ) => 
new Term<PLam<PList<PData>, PAsData<PList<PAsData<ToPType<ElT>>>>>>(
    lam( list( data ), asData( list( asData( elemsT ) ) ) ),
    _dbn => IRNative.listData
);

const pMapToData = <A extends TermType, B extends TermType>( fstT: A, sndT: B ) =>
new Term<PLam<
    PList<PPair<PData,PData>>,
    PAsData<PList<PPair<
        PAsData<ToPType<A>>,
        PAsData<ToPType<B>>
    >>>
>>(
    lam(
        list( pair( data, data ) ),
        asData( list( pair( asData( fstT ), asData( sndT ) ) ) )
    ) as any,
    _dbn => IRNative.mapData
);

const ppairData = ( fstT: TermType, sndT: TermType ) => new Term(
    fn([ data, data ], pair( fstT, sndT ) ),
    _dbn => IRNative.mkPairData
);

const pPairToData = ( fstT: TermType, sndT: TermType ) =>
    phoist(
        plam(
            pair( fstT, sndT ),
            asData( pair( fstT, sndT ) )
        )
        ( _pair => {

            /*
            `pfstPair` and `psndPair` will extract `asData` types automatically

            this is done to provide support for pairs generated dynamically;
            however transforming pairs to data we already have data fields there
            so it makes no sense extracting data to re-transform it to data.
            */

            const _fstData = fstT[0] === PrimType.AsData ?
                pfstPair( data, data ).$( _punsafeConvertType( _pair, pair( data, data ) ) as any ) : 
                _toData( fstT )( _pair.fst );

            const _sndData = sndT[0] === PrimType.AsData ?
                psndPair( data, data ).$( _punsafeConvertType( _pair, pair( data, data ) ) as any ) : 
                _toData( sndT )( _pair.snd );

            return (
                _papp(
                    pListToData( data ),
                    pList( data )([
                        _fstData,
                        _sndData
                    ])
                ) as any
            )
        })
    );

export function _toData<T extends TermType>( t: T ): ( term: Term<ToPType<T>> ) => Term<PAsData<ToPType<T>>>
{
    if( isTaggedAsAlias( t ) ) return _toData( unwrapAlias( t as any ) ) as any;
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) =>
            punsafeConvertType( term, asData( t ) as any )) as any;

    function applyToTerm( termFunc: Term<PLam<ToPType<T>, PAsData<ToPType<T>>>> ): ( term: Term<ToPType<T>> ) => Term<PAsData<ToPType<T>>>
    {
        return ( term ) => {
            const theTerm = _punsafeConvertType(
                _papp( termFunc, term ),
                asData( t )
            ) as any;
            theTerm.isConstant = (term as any).isConstant;
            return theTerm;
        }
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
    ){
        const elemsT = getElemsT( t ) as PairT<TermType,TermType>;
        const fstT = getFstT( elemsT );
        const sndT = getSndT( elemsT );
        return applyToTerm( pMapToData( fstT, sndT ) as any );
    }

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


        return (( term: Term<any> ) => {
            const theTerm = _papp(
                pMapToData( fstT, sndT ) as any,
                _pmap( elemsT, pair( asData( fstT ) , asData( sndT ) ) )
                .$(
                    ((_pair: any) => {

                        return _papp(
                            _papp(
                                ppairData( fstT, sndT ) as any,
                                _toData( fstT )( _pair.fst )
                            ) as any,
                            _toData( sndT )( _pair.snd )
                        )                        
                    }
                    ) as any
                )
                .$( term )
            ) as any;
            theTerm.isConstant = (term as any).isConstant;
            return theTerm;
        }) as any;
    };
    
    if(
        typeExtends(
            t,
            list( data )
        )
    ) return applyToTerm( pListToData( getElemsT( t ) ) as any );

    if(
        typeExtends(
            t, 
            list( 
                tyVar()
            )
        )
    )
    {
        const elemsT = getElemsT( t ) as PairT<TermType,TermType>;
        return (( term: Term<any> ) => {
            const theTerm = _papp(
                pListToData( asData( elemsT ) ),
                _pmap( elemsT, asData(elemsT) )
                .$( _ptoData( elemsT ) )
                .$( term )
            ) as any;
            theTerm.isConstant = (term as any).isConstant;
            return theTerm;
        }) as any;
    };

    return applyToTerm( _ptoData( t ) );
}

/**
 * @deprecated use `_toData` instead
 */
export const toData_minimal = _toData;

function pid<T extends TermType, TT extends TermType>( fromT: T, toT: TT ): TermFn<[ ToPType<T> ], ToPType<TT>>
{
    return phoist(
        plam( fromT, toT )( x => punsafeConvertType( x, toT ) )
    ) as any;
}

export function _ptoData<T extends TermType>( t: T ): Term<PLam<ToPType<T>, PAsData<ToPType<T>>>>
{
    if( isTaggedAsAlias( t ) ) return _ptoData( unwrapAlias( t as any ) ) as any;
    if( typeExtends( t, data ) ) 
        return pid( t, asData( t ) );

    if( typeExtends( t, int ) )     return pIntToData   as any;
    if( typeExtends( t, bs ) )      return pBSToData    as any;
    if( typeExtends( t, str ) )     return pStrToData   as any;
    if( typeExtends( t, unit ) )    return pUnitToData  as any;
    if( typeExtends( t, bool ) )    return pBoolToData  as any;
    
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
    ){
        const entryT = getElemsT( t );
        const kT = getFstT( entryT );
        const vT = getSndT( entryT );
        return pMapToData( kT, vT ) as any;
    };

    if(
        typeExtends(
            t,
            list( data )
        )
    ) return pListToData( getElemsT( t ) ) as any;

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
        const fstT = unwrapAlias( t[1] as any );
        const sndT = unwrapAlias( t[2] as any );
        return pPairToData( fstT, sndT ) as any;
    };

    return plam( t, asData( t ) )( _toData(t) );
}

/**
 * @deprecated use `_ptoData` instead
 */
export const ptoData_minimal = _ptoData