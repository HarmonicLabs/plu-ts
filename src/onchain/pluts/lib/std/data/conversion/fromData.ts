import { PType } from "../../../../PType";
import { PData } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { ListT, PairT, PrimType, asData, bool, lam, list, pair, tyVar, unit } from "../../../../type_system";
import { TermType, bs, data, int, str } from "../../../../type_system";
import { isTaggedAsAlias } from "../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../type_system/unwrapAlias";
import { pListToData, pMapToData, pdecodeUtf8, punBData, punIData, punListData, punMapData } from "../../../builtins";
import { ppairData } from "../../../builtins/ppairData";
import { papp } from "../../../papp";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { plet } from "../../../plet";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolFromData } from "../../bool";
import { pcompose } from "../../combinators";
import { pmap } from "../../list";
import { pUnitFromData } from "../../unit";

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

export function fromData<T extends TermType>( t: T ): ( term: Term<PData> ) => Term<ToPType<T>>
{
    if( isTaggedAsAlias( t ) ) return fromData( unwrapAlias( t ) ) as any;

    // unwera asData before `t extends data`
    if( t[0] === PrimType.AsData ) t = t[1] as T;
    
    if( typeExtends( t, data ) ) 
        return (( term: Term<PType> ) =>
            punsafeConvertType( term, t as any )) as any;

    function applyToTerm( termFunc: Term<any> ): ( term: Term<PData> ) => Term<ToPType<T>>
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
        const elemsT = t[1] as PairT<TermType,TermType>;
        const fstT = elemsT[1];
        const sndT = elemsT[2];
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
        const elemsT = t[1] as TermType;
        return (
            ( term: Term<PData> ) => 
                punsafeConvertType(
                    punListData.$( term ),
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

export function pfromData<T extends TermType>( t: T ): TermFn<[ PData ], ToPType<T> >
{
    if( isTaggedAsAlias( t ) ) return pfromData( unwrapAlias( t ) ) as any;
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