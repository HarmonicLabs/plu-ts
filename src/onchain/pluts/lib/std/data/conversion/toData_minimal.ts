import { DataConstr } from "../../../../../../types/Data";
import { Builtin } from "../../../../../UPLC/UPLCTerms/Builtin";
import { PType } from "../../../../PType";
import { PByteString, PData, PInt, PLam, PString } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { TermType, bs, data, fn, int, str, PairT, asData, bool, lam, list, pair, tyVar, unit } from "../../../../type_system";
import { isTaggedAsAlias } from "../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../type_system/unwrapAlias";
import { papp } from "../../../papp";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolToData } from "../../bool/pBoolToData";
import { pList, pmap } from "../../list";
import { pData } from "../pData";
import { _papp, _pcompose } from "./minimal_common";

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
                _pcompose( str, bs, data ),
                pBSToData
            ),
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

const pMapToData =  new Term(
    lam(
        list( pair( data, data ) ),
        asData( list( pair( data, data ) ) )
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
                pListToData,
                pList( data )([
                    toData_minimal( fstT )( _pair.fst ),
                    toData_minimal( sndT )( _pair.snd )
                ])
            ) as any
        )) as any
    );

export function toData_minimal<T extends TermType>( t: T ): ( term: Term<ToPType<T>> ) => Term<PData>
{
    if( isTaggedAsAlias( t ) ) return toData_minimal( unwrapAlias( t ) ) as any;
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) =>
            punsafeConvertType( term, t as any )) as any;

    function applyToTerm( termFunc: Term<any> ): ( term: Term<ToPType<T>> ) => Term<PData>
    {
        return ( term ) => papp( termFunc, term );
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
    ) return applyToTerm( pMapToData );

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
        const elemsT = t[1] as PairT<TermType,TermType>;
        const fstT = elemsT[1];
        const sndT = elemsT[2];
        return (( term: Term<any> ) => {
            return _papp(
                pMapToData,
                pmap( elemsT, pair( data, data ) )
                .$(
                    ((_pair: any) =>
                        _papp(
                            _papp(
                                ppairData,
                                toData_minimal( fstT )( _pair.fst )
                            ),
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
        const elemsT = t[1] as PairT<TermType,TermType>;
        return (( term: Term<any> ) => {
            return _papp(
                pMapToData,
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
        const fstT = t[1] as TermType;
        const sndT = t[2] as TermType;
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
    if( isTaggedAsAlias( t ) ) return toData_minimal( unwrapAlias( t ) ) as any;
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
        const elemsT = t[1] as PairT<TermType,TermType>;
        const fstT = elemsT[1];
        const sndT = elemsT[2];
        return plam( t, data )
        ((( term: any ) => {
            return _papp(
                pMapToData,
                pmap( elemsT, pair( data, data ) )
                .$(
                    ((_pair: any) =>
                        _papp(
                            _papp(
                                ppairData,
                                toData_minimal( fstT )( _pair.fst )
                            ),
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
        const elemsT = t[1] as TermType;
        return plam( t, data )
        ((( term: Term<any> ) => {
            return _papp(
                pMapToData,
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
        const fstT = t[1] as TermType;
        const sndT = t[2] as TermType;
        return pPairToData( fstT, sndT ) as any;
    };

    if(
        typeExtends( t, data )
    ) return ((x: any) => x) as any;

    return ((x: any) => punsafeConvertType( x, data )) as any
}