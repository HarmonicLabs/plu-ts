import ObjectUtils from "../../../../../../utils/ObjectUtils";

import type { PData }  from "../../../../PTypes/PData/PData";
import { Term, dynPair }  from "../../../../Term";
import type { TermFn } from "../../../../PTypes/PFn";

import { BasePlutsError } from "../../../../../../errors/BasePlutsError";
import { ConstantableTermType, StructType, TermType, tyVar } from "../../../../Term/Type/base";
import { Type, int, bs, str, unit, bool, list, data, pair } from "../../../../Term/Type/base";
import { typeExtends } from "../../../../Term/Type/extension";
import { isAliasType, isStructType, isDataType, isListType, isPairType, isConstantableTermType } from "../../../../Term/Type/kinds";
import { cloneWithAllPairsAsDynamic, termTypeToString } from "../../../../Term/Type/utils";
import { unwrapAlias } from "../../../../PTypes/PAlias/unwrapAlias";

import { pdataPairToDynamic } from "../../pair/pdynPair";
import type { ToPType } from "../../../../Term/Type/ts-pluts-conversion";
import type { PType } from "../../../../PType";
import { pcompose } from "../../combinators";
import { pUnitFromData } from "../../unit/pUnitFromData";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { pBoolFromData } from "../../bool/pBoolFromData";
import { pdecodeUtf8, punBData, punIData, punListData, punMapData } from "../../../builtins";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { pmap } from "../../list/pmap";
import type { TermPair } from "../../UtilityTerms/TermPair";

export function getFromDataTermForType<T extends ConstantableTermType | StructType>( t: T )
: TermFn<[ PData ], ToPType<T>>
{
    if( isAliasType( t ) ) return getFromDataTermForType( unwrapAlias( t ) ) as any;
    if( isStructType( t ) ) return phoist(
        plam( data , t )
        ( ( term: Term<PData> ) => punsafeConvertType( term, t ) )
    ) as any;

    if( typeExtends( t, int ) )     return punIData as any;
    if( typeExtends( t, bs  ) )     return punBData as any;
    if( typeExtends( t, str ) )     return pcompose.$( pdecodeUtf8 ).$( punBData ) as any;
    if( typeExtends( t, unit ) )    return pUnitFromData as any;
    if( typeExtends( t, bool ) )    return pBoolFromData as any;

    // map
    if( 
        typeExtends(
            t,
            list(
                pair(
                    tyVar(),tyVar()
                )
            )
        )
    )
    {
        const _t = cloneWithAllPairsAsDynamic( t );
        const keyT = _t[1][1] as TermType;
        const valT = _t[1][2] as TermType;

        if(
            isDataType( keyT ) &&
            isDataType( valT )
        ) return punMapData( keyT, valT ) as any;

        if( !isConstantableTermType( keyT ) || !isConstantableTermType( valT ) )
        throw new BasePlutsError(
            "can't get 'fromData' for non constant type"
        );


        return plam( data, _t )
        ( dataTerm => {
            
            return punsafeConvertType(
                punMapData( data, data ).$( dataTerm ),
                _t
            ) as any;

        }) as any;
    }

    if( isListType( t ) )
    {
        const elemsT = t[1] as any;
        if( isDataType( elemsT ) ) return punListData( data ) as any;

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

            return pdataPairToDynamic( fstT, sndT )( dataTerm );
        }) as any ) as any;
    }

    throw new BasePlutsError(
        "'getFromDataForType'; type '" + termTypeToString( t ) + "' cannot be retreived from data"
    );
}

/**
 * @deprecated
 */
export function getFromDataForType<T extends ConstantableTermType | StructType>( t: T )
    :( term: Term<PData> ) => Term<ToPType<T>>
{
    if( isAliasType( t ) ) return getFromDataForType( unwrapAlias( t ) ) as any;
    if( isDataType( t ) || isStructType( t ) ) return ( ( term: Term<PData> ) => punsafeConvertType( term, t ) ) as any;

    // map
    if( 
        typeExtends(
            t,
            list(
                pair(
                    tyVar(),tyVar()
                )
            )
        )
    )
    {
        return (dataTerm: any) => ObjectUtils.defineReadOnlyHiddenProperty(
            getFromDataTermForType( t ).$( dataTerm ) as any,
            "__isListOfDynPairs",
            true
        );
    }
    
    if( isListType( t ) )
    {
        const elemsT = t[1];

        if( !isConstantableTermType( elemsT ) )
        throw new BasePlutsError(
            "can't get a list of elements that can't be transfored to data form a data element"
        );

        if( isDataType( t[1] ) ) return ( d: Term<PData> ) => punListData( data ).$( d ) as any;

        const elemToDataTerm = getFromDataTermForType( elemsT as T );

        return ( termDataList: Term<PData> ) => pmap( data, elemsT ).$( elemToDataTerm ).$( punListData( data ).$( termDataList) ) as any;
    }

    if( isPairType( t ) )
    {
        const fstT = t[1];
        const sndT = t[2];

        if(!( isConstantableTermType( fstT ) && isConstantableTermType( sndT ) ))
        throw new BasePlutsError(
            "can't get 'fromData' for a pair that has non constant types as arguments"
        );

        return pdataPairToDynamic( fstT, sndT ) as any;
    }

    return ( d: Term<PData> ) =>  getFromDataTermForType( t ).$( d ) as any;
}