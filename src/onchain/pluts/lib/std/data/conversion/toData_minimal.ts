import { DataConstr } from "../../../../../../types/Data";
import { Builtin } from "../../../../../UPLC/UPLCTerms/Builtin";
import { PType } from "../../../../PType";
import { PByteString, PData, PInt, PLam, PString } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { TermType, bs, data, fn, int, str, PairT, asData, bool, lam, list, pair, tyVar, unit, termTypeToString } from "../../../../type_system";
import { isTaggedAsAlias } from "../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../type_system/tyArgs/unwrapAlias";
import { papp } from "../../../papp";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolToData } from "../../bool/pBoolToData";
import { pList, pmap } from "../../list";
import { pData } from "../pData";
import { _papp, _pcompose } from "./minimal_common";
import { getElemsT, getFstT, getSndT } from "../../../../type_system/tyArgs";

const pIntToData  =new Term<PLam<PInt, PData>>(
    lam( int, asData( int ) ) as any,
    _dbn => Builtin.iData
);

const pBSToData = new Term<PLam<PByteString, PData>>(
    lam( bs, asData( bs ) ) as any,
    _dbn => Builtin.bData
);

const pencodeUtf8  =new Term<PLam<PString, PByteString>>(
    lam( str, bs ),
    _dbn => Builtin.encodeUtf8
);

const pStrToData =
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
    plam( unit, data )
    ( _ => pData(new DataConstr(0,[])) )
);

const pListToData = new Term(
    lam( list( data ), data ),
    _dbn => Builtin.listData
);

const pMapToData = ( fstT: TermType, sndT: TermType ) => new Term(
    lam(
        list( pair( data, data ) ),
        asData( list( pair( asData( fstT ), asData( sndT ) ) ) )
    ) as any,
    _dbn => Builtin.mapData
);

const ppairData = new Term(
    fn([ data, data ], pair( data, data ) ),
    _dbn => Builtin.mkPairData
);

const pPairToData = ( fstT: TermType, sndT: TermType ) =>
    phoist(
        plam(
            pair( fstT, sndT ),
            asData( pair( fstT, sndT ) )
        )
        ( _pair => (
            _papp(
                pListToData as any,
                pList( data )([
                    toData_minimal( fstT )( _pair.fst ),
                    toData_minimal( sndT )( _pair.snd )
                ])
            ) as any
        )) as any
    );

export function toData_minimal<T extends TermType>( t: T ): ( term: Term<ToPType<T>> ) => Term<PData>
{
    if( isTaggedAsAlias( t ) ) return toData_minimal( unwrapAlias( t as any ) ) as any;
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) =>
            punsafeConvertType( term, asData( t ) as any )) as any;

    function applyToTerm( termFunc: Term<any> ): ( term: Term<ToPType<T>> ) => Term<PData>
    {
        return ( term ) => _papp( termFunc, term ) as any;
    }

    if( typeExtends( t, int ) )     return applyToTerm( pIntToData );
    if( typeExtends( t, bs ) )      return applyToTerm( pBSToData );
    if( typeExtends( t, str ) )     return applyToTerm( pStrToData );
    if( typeExtends( t, unit ) )    return applyToTerm( pUnitToData );
    if( typeExtends( t, bool ) )    return applyToTerm( pBoolToData );
    
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
        return applyToTerm( pMapToData( fstT, sndT ) );
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
            return _papp(
                pMapToData( fstT, sndT ) as any,
                pmap( elemsT, pair( asData( fstT ) , asData( sndT ) ) )
                .$(
                    ((_pair: any) =>
                        _papp(
                            _papp(
                                ppairData as any,
                                toData_minimal( fstT )( _pair.fst )
                            ) as any,
                            toData_minimal( sndT )( _pair.snd )
                        )
                    ) as any
                )
                .$( term )
            )
        }) as any;
    };
    
    if(
        typeExtends(
            t,
            list( data )
        )
    ) return applyToTerm( pListToData );

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
            return _papp(
                pListToData as any,
                pmap( elemsT, pair( data, data ) )
                .$( ptoData_minimal( elemsT ) as any )
                .$( term )
            );
        }) as any;
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
        return (( term: Term<any> ) => pPairToData( fstT, sndT ).$( term )) as any;
    };

    return ((x: any) => punsafeConvertType( x, data )) as any
}

function pid<T extends TermType, TT extends TermType>( fromT: T, toT: TT ): TermFn<[ ToPType<T> ], ToPType<TT>>
{
    // @ts-ignore Type instantiation is excessively deep and possibly infinite
    return phoist(
        plam( fromT, toT )( x => punsafeConvertType( x, toT ) )
    ) as any;
}

function ptoData_minimal<T extends TermType>( t: T ): Term<PLam<ToPType<T>, PData>>
{
    if( isTaggedAsAlias( t ) ) return toData_minimal( unwrapAlias( t as any ) ) as any;
    if( typeExtends( t, data ) ) 
        return pid( t, data );


    if( typeExtends( t, int ) )     return pIntToData as any;
    if( typeExtends( t, bs ) )      return pBSToData as any;
    if( typeExtends( t, str ) )     return pStrToData as any;
    if( typeExtends( t, unit ) )    return pUnitToData as any;
    if( typeExtends( t, bool ) )    return pBoolToData as any;
    
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
    ) return pMapToData as any;

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
        return plam( t, data )
        ((( term: any ) => {
            return _papp(
                pMapToData( fstT, sndT ) as any,
                pmap( elemsT, pair( data, data ) )
                .$(
                    ((_pair: any) =>
                        _papp(
                            _papp(
                                ppairData as any,
                                toData_minimal( fstT )( _pair.fst )
                            ) as any,
                            toData_minimal( sndT )( _pair.snd )
                        )
                    ) as any
                )
                .$( term )
            )
        }) as any)
    };
    
    if(
        typeExtends(
            t,
            list( data )
        )
    ) return pListToData as any;

    if(
        typeExtends(
            t, 
            list( 
                tyVar()
            )
        )
    )
    {
        const elemsT = getElemsT( t ) as TermType;
        return plam( t, data )
        ((( term: Term<any> ) => {
            return _papp(
                pListToData as any,
                pmap( elemsT, pair( data, data ) )
                .$( ptoData_minimal( elemsT ) as any )
                .$( term )
            )
        }) as any);
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
        return pPairToData( fstT, sndT ) as any;
    };

    if(
        typeExtends( t, data )
    ) return ((x: any) => x) as any;

    return ((x: any) => punsafeConvertType( x, data )) as any
}