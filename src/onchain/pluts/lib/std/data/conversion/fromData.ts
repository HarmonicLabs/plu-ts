import { PType } from "../../../../PType";
import { PData } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { PairT, PrimType, asData, bool, lam, list, pair, tyVar, unit } from "../../../../type_system";
import { TermType, bs, data, int, str } from "../../../../type_system";
import { isTaggedAsAlias } from "../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../type_system/tyArgs/unwrapAlias";
import { ppairData } from "../../../builtins/ppairData";
import { pdecodeUtf8 } from "../../../builtins/str";
import { papp } from "../../../papp";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { plet } from "../../../plet";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolFromData } from "../../bool";
import { pcompose } from "../../combinators";
import { pUnitFromData } from "../../unit";
import { punBData, punIData, punListData, punMapData } from "../../../builtins/data";
import { getElemsT, getFstT, getSndT } from "../../../../type_system/tyArgs";
import { UtilityTermOf } from "../../../addUtilityForType";
import { pmap } from "../../list/pmap";


const pStrFromData =
    phoist(
        pcompose( data, bs, str ).$( pdecodeUtf8 ).$( punBData )
    );

const pPairFromData =
    phoist(
        plam(
            data,
            pair( data, data )
        )
        ( assumedList =>
            plet(
                punListData.$( assumedList )
            ).in( listData =>
                ppairData
                .$( listData.head )
                .$( listData.tail.head )
            )
        )
    );

export function fromData<T extends TermType>( t: T ): ( term: Term<PData> ) => UtilityTermOf<ToPType<T>>
{
    if( isTaggedAsAlias( t ) ) return fromData( unwrapAlias( t as any ) ) as any;

    // unwrap asData before `t extends data`
    if( t[0] === PrimType.AsData ) t = t[1] as T;
    
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) =>
            punsafeConvertType( term, t as any )) as any;

    function applyToTerm( termFunc: Term<any> ): ( term: Term<PData> ) => UtilityTermOf<ToPType<T>>
    {
        return ( term ) => papp( termFunc, term );
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
        const elemsT = getElemsT( t ) as PairT<TermType,TermType>;
        const fstT = getFstT( elemsT );
        const sndT = getSndT( elemsT );
        return (
            ( term: Term<any> ) => 
                punsafeConvertType(
                    punMapData.$( term ),
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
        const elemsT = getElemsT( t );

        return ( term: Term<PData> ) => {

            return punListData
                .$( term )
                .map( pfromData( elemsT ) ) as any
        }
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

export function pfromData<T extends TermType>( t: T ): TermFn<[ PData ], ToPType<T> >
{
    if( isTaggedAsAlias( t ) ) return pfromData( unwrapAlias( t as any ) ) as any;
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
        return pcompose( data, list( data ) , t )
            .$( pmap( data, elemsT ).$( pfromData(elemsT) ) as any )
            .$( punListData )
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

    return ((x: any) => punsafeConvertType( x, data )) as any
}