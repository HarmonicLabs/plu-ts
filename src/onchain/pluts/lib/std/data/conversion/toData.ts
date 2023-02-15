import { DataConstr } from "../../../../../../types/Data";
import { PType } from "../../../../PType";
import { PData } from "../../../../PTypes";
import { TermFn } from "../../../../PTypes/PFn/PFn";
import { Term } from "../../../../Term";
import { PairT, asData, bool, list, pair, tyVar, unit } from "../../../../type_system";
import { TermType, bs, data, int, str } from "../../../../type_system";
import { isTaggedAsAlias } from "../../../../type_system/kinds/isTaggedAsAlias";
import { ToPType } from "../../../../type_system/ts-pluts-conversion";
import { typeExtends } from "../../../../type_system/typeExtends";
import { unwrapAlias } from "../../../../type_system/unwrapAlias";
import { pBSToData, pIntToData, pListToData, pMapToData, pencodeUtf8 } from "../../../builtins";
import { ppairData } from "../../../builtins/ppairData";
import { papp } from "../../../papp";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pBoolToData } from "../../bool/pBoolToData";
import { pcompose } from "../../combinators";
import { pList, pmap } from "../../list";
import { pData } from "../pData";

const pStrToData =
    phoist(
        pcompose( str, bs, data ).$( pBSToData ).$( pencodeUtf8 )
    );

const pUnitToData = phoist(
    plam( unit, data )
    ( _ => pData(new DataConstr(0,[])) )
);

const pPairToData = ( fstT: TermType, sndT: TermType ) =>
    phoist(
        plam(
            pair( fstT, sndT ),
            asData( pair( fstT, sndT ) )
        )
        ( _pair => (pListToData.$(
            pList( data )([
                toData( fstT )( _pair.fst ),
                toData( sndT )( _pair.snd )
            ])
        )) as any )
    )

export function toData<T extends TermType>( t: T ): ( term: Term<ToPType<T>> ) => Term<PData>
{
    if( isTaggedAsAlias( t ) ) return toData( unwrapAlias( t ) ) as any;
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
            pMapToData.$(
                pmap( elemsT, pair( data, data ) )
                .$(
                    _pair => 
                        ppairData
                        .$( toData( fstT )( _pair.fst ) )
                        .$( toData( sndT )( _pair.snd ) )
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
            pMapToData.$(
                pmap( elemsT, pair( data, data ) )
                .$( ptoData( elemsT ) as any )
                .$( term )
            )
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


    if(
        typeExtends( t, data )
    ) return ((x: any) => x) as any;

    return ((x: any) => punsafeConvertType( x, data )) as any
}

function pid<T extends TermType, TT extends TermType>( fromT: T, toT: TT ): TermFn<[ ToPType<T> ], ToPType<TT>>
{
    // @ts-ignore Type instantiation is excessively deep and possibly infinite
    return phoist(
        plam( fromT, toT )( x => punsafeConvertType( x, toT ) )
    ) as any;
}

export function ptoData<T extends TermType>( t: T ): TermFn<[ ToPType<T> ], PData>
{
    if( isTaggedAsAlias( t ) ) return toData( unwrapAlias( t ) ) as any;
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
        (( term ) => {
            return pMapToData.$(
                pmap( elemsT, pair( data, data ) )
                .$(
                    _pair => 
                        ppairData
                        // @ts-ignore Type instantiation is excessively deep and possibly infinite
                        .$( toData( fstT )( _pair.fst ) )
                        // @ts-ignore Type instantiation is excessively deep and possibly infinite
                        .$( toData( sndT )( _pair.snd ) )
                )
                .$( term as any )
            )
        })
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
        (( term: Term<any> ) => {
            return pMapToData.$(
                pmap( elemsT, pair( data, data ) )
                .$( ptoData( elemsT ) as any )
                .$( term )
            )
        });
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