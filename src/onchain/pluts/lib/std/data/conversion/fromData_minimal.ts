import { UtilityTermOf } from "../../..";
import { Application } from "../../../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../../../UPLC/UPLCTerms/Builtin";
import { HoistedUPLC } from "../../../../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../../../../PType";
import { PByteString, PData, PLam, PString } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { PairT, PrimType, asData, bool, fn, lam, list, pair, tyVar, unit } from "../../../../type_system";
import { TermType, bs, data, int, str } from "../../../../type_system";
import { isTaggedAsAlias } from "../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../type_system/unwrapAlias";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { plet } from "../../../plet";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolFromData } from "../../bool";
import { pUnitFromData } from "../../unit";
import { _papp, _pcompose } from "./minimal_common";

const punBData = new Term<PLam<PData, PByteString>>(
    lam( data, bs ),
    _dbn => Builtin.unBData
);

const punIData = new Term(
    lam( data, int ),
    _dbn => Builtin.unIData,
);

const pdecodeUtf8  =new Term<PLam<PByteString, PString>>(
    lam( bs, str ),
    _dbn => Builtin.decodeUtf8,
);

const punListData = new Term(
    lam( data, list( data ) ),
    _dbn => Builtin.unListData
);

const punMapData = new Term(
    lam( data, list( pair( data, data ) ) ) as any,
    _dbn => Builtin.unMapData
);

const ppairData = new Term(
    fn([ data, data ], pair( data, data ) ),
    _dbn => Builtin.mkPairData
)

const pStrFromData =
    phoist(
        _papp(
            _papp(
                _pcompose( data, bs, str ),
                pdecodeUtf8,
            ),
            punBData
        )
    );

const pPairFromData =
    phoist(
        plam(
            data,
            pair( data, data )
        )
        ( assumedList =>
            plet(
                _papp( punListData, assumedList )
            ).in( listData =>
                _papp(
                    _papp(
                        ppairData,
                        (listData as any).head
                    ),
                    (listData as any).tail.head
                )
            ) as any
        )
    );

export function fromData_minimal<T extends TermType>( t: T ): ( term: Term<PData> ) => Term<ToPType<T>>
{
    if( isTaggedAsAlias( t ) ) return fromData_minimal( unwrapAlias( t ) ) as any;

    // unwrap asData before `t extends data`
    if( t[0] === PrimType.AsData ) t = t[1] as T;
    
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) =>
            punsafeConvertType( term, t as any )) as any;

    function applyToTerm( termFunc: Term<any> ): ( term: Term<PData> ) => UtilityTermOf<ToPType<T>>
    {
        return ( term ) => _papp( termFunc, term ) as any;
    }

    if( typeExtends( t, int ) )     return applyToTerm( punIData );
    if( typeExtends( t, bs ) )      return applyToTerm( punBData );
    if( typeExtends( t, str ) )     return applyToTerm( pStrFromData );
    if( typeExtends( t, unit ) )    return applyToTerm( pUnitFromData );
    if( typeExtends( t, bool ) )    return applyToTerm( pBoolFromData );
    
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
    ) return applyToTerm( punMapData );

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
        return (
            ( term: Term<any> ) => 
                punsafeConvertType(
                    _papp(
                        punMapData,
                        term
                    ),
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
        const elemsT = t[1] as TermType;
        return (
            ( term: Term<PData> ) => 
                punsafeConvertType(
                    _papp(
                        punListData,
                        term
                    ),
                    list(
                        asData( elemsT )
                    )
                )
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
        const fstT = t[1] as TermType;
        const sndT = t[2] as TermType;
        return (( term: Term<PData> ) =>
            punsafeConvertType(
                pPairFromData.$( term ),
                pair(
                    asData( fstT ),
                    asData( sndT )
                )
            ) as any
        )
    };

    return ((x: any) => punsafeConvertType( x, t ));
}

function pid<T extends TermType, TT extends TermType>( fromT: T, toT: TT ): TermFn<[ ToPType<T> ], ToPType<TT>>
{
    return phoist(
        plam( fromT, toT )( x => punsafeConvertType( x, toT ) )
    ) as any;
}

function pfromData_minimal<T extends TermType>( t: T ): TermFn<[ PData ], ToPType<T> >
{
    if( isTaggedAsAlias( t ) ) return pfromData_minimal( unwrapAlias( t ) ) as any;
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
    ) return punMapData as any;

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
        const elemsT = t[1] as TermType;
        return punsafeConvertType(
            punListData,
            lam(
                data,
                list(
                    asData( elemsT )
                )
            )
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
        const fstT = t[1] as TermType;
        const sndT = t[2] as TermType;
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

    return ((x: any) => punsafeConvertType( x, data )) as any
}