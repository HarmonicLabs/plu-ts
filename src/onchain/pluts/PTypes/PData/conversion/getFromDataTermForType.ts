import PData from "../PData";
import BasePlutsError from "../../../../../errors/BasePlutsError";
import { ppairData, pfstPair, psndPair, punListData } from "../../../stdlib/Builtins";
import { pmap } from "../../../stdlib/List/methods";
import { phoist, plam } from "../../../Syntax/syntax";
import punsafeConvertType from "../../../Syntax/punsafeConvertType";
import Term from "../../../Term";
import Type, { ConstantableTermType, StructType, ToPType, int, bs, str, unit, bool, list, data, pair } from "../../../Term/Type/base";
import { typeExtends } from "../../../Term/Type/extension";
import { isAliasType, isStructType, isDataType, isListType, isPairType, isConstantableTermType } from "../../../Term/Type/kinds";
import { termTypeToString } from "../../../Term/Type/utils";
import unwrapAlias from "../../PAlias/unwrapAlias";
import PBool from "../../PBool";
import PByteString from "../../PByteString";
import { TermFn } from "../../PFn/PLam";
import PInt from "../../PInt";
import PList from "../../PList";
import PString from "../../PString";
import PUnit from "../../PUnit";
import { pdynPair } from "../../PPair/pdynPair";
import PPair from "../../PPair";
import { PType } from "../../..";
import TermPair from "../../../stdlib/TermPair";


export function getFromDataTermForType<T extends ConstantableTermType | StructType>( t: T )
: TermFn<[ PData ], ToPType<T>>
{
    if( isAliasType( t ) ) return getFromDataTermForType( unwrapAlias( t ) ) as any;
    if( isStructType( t ) ) return phoist(
        plam( data , t )
        ( ( term: Term<PData> ) => punsafeConvertType( term, t ) )
    ) as any;

    if( typeExtends( t, int ) )     return PInt.fromDataTerm as any;
    if( typeExtends( t, bs  ) )     return PByteString.fromDataTerm as any;
    if( typeExtends( t, str ) )     return PString.fromDataTerm as any;
    if( typeExtends( t, unit ) )    return PUnit.fromDataTerm as any;
    if( typeExtends( t, bool ) )    return PBool.fromDataTerm as any;

    if( isListType( t ) )
    {
        const elemsT = t[1] as any;
        if( isDataType( elemsT ) ) return PList.fromDataTerm as any;

        // TODO: this can be optimized
        return plam( data, list(elemsT) )
        (dataTerm => 
            pmap( data, elemsT ).$( getFromDataTermForType( t ) ).$( punListData( data ).$( dataTerm ) )
        ) as any;
    }

    if( isPairType( t ) )
    {
        const fstT = t[1];
        const sndT = t[2];

        if( !isConstantableTermType( fstT ) || !isConstantableTermType( sndT ) )
        throw new BasePlutsError(
            "can't get 'fromData' for non constant type"
        );

        return plam( data, t )
        ((( dataTerm: Term<PData> ): TermPair<PType, PType> => {

            const dataTermTy = dataTerm.type;
            if(!(
                // either extends data pair
                typeExtends( dataTermTy, Type.Data.Pair( data, data ) ) ||
                // or is exactly the generic `data` type
                ( typeExtends( dataTermTy, data ) && typeExtends( data, dataTermTy ) )
            ))
            throw new BasePlutsError(
                "`fromData` for `pair` type: passed argument didn't extend `data`"
            );

            const term = punsafeConvertType(
                dataTerm, pair( data, data )
            );

            const pdataFst = pfstPair( data, data );
            const pdataSnd = psndPair( data, data );

            return pdynPair( fstT, sndT )( pdataFst.$( term ), pdataSnd.$( term ) )
        }) as any ) as any;
    }

    throw new BasePlutsError(
        "'getFromDataForType'; type '" + termTypeToString( t ) + "' cannot be retreived from data"
    );
}


export function getFromDataForType<T extends ConstantableTermType | StructType>( t: T )
    :( term: Term<PData> ) => Term<ToPType<T>>
{
    if( isAliasType( t ) ) return getFromDataForType( unwrapAlias( t ) ) as any;
    if( isDataType( t ) || isStructType( t ) ) return ( ( term: Term<PData> ) => punsafeConvertType( term, t ) ) as any;

    if( typeExtends( t, int ) )     return PInt.fromData as any;
    if( typeExtends( t, bs  ) )     return PByteString.fromData as any;
    if( typeExtends( t, str ) )     return PString.fromData as any;
    if( typeExtends( t, unit ) )    return PUnit.fromData as any;
    if( typeExtends( t, bool ) )    return PBool.fromData as any;
    
    if( isListType( t ) )
    {
        const elemsT = t[1];

        if( !isConstantableTermType( elemsT ) )
        throw new BasePlutsError(
            "can't get a list of elements that can't be transfored to data form a data element"
        );

        if( isDataType( t[1] ) ) return PList.fromData as any;

        const elemToDataTerm = getFromDataTermForType( elemsT as T );

        return ( termDataList: Term<PData> ) => pmap( data, elemsT ).$( elemToDataTerm ).$( PList.fromData( termDataList) ) as any;
    }

    if( isPairType( t ) )
    {
        const fstT = t[1];
        const sndT = t[2];

        if(!( isConstantableTermType( fstT ) && isConstantableTermType( sndT ) ))
        throw new BasePlutsError(
            "can't get 'fromData' for non constant type"
        );

        return (( term: Term<PPair<PType, PType>> ) => {
            const pairTy = term.type;
            if( !isPairType( pairTy ) )
            throw new BasePlutsError(
                "passed term is not a pair; can't convert from data"
            );

            const pthisFst = pfstPair( pairTy[1], pairTy[2] );
            const pthisSnd = psndPair( pairTy[1], pairTy[2] );

            return pdynPair( fstT, sndT )( pthisFst.$( term ), pthisSnd.$( term ) )
        }) as any;
    }

    /**
     * @todo add proper error
     */
    throw new BasePlutsError(
        "'getFromDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
    );
}