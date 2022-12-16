import type PData from "../PData";
import type Term from "../../../Term";
import { ConstantableTermType, dynPair, lam, StructType, TermType, tyVar } from "../../../Term/Type/base";
import type { TermFn } from "../../PFn";
import type PPair from "../../PPair";
import type PType from "../../../PType";
import type TermPair from "../../../stdlib/UtilityTerms/TermPair";

import BasePlutsError from "../../../../../errors/BasePlutsError";
import { pfstPair, psndPair, punListData, punMapData } from "../../../stdlib/Builtins";
import { pmap } from "../../../stdlib/List/methods";
import { phoist, plam } from "../../../Syntax/syntax";
import punsafeConvertType from "../../../Syntax/punsafeConvertType";
import Type, { int, bs, str, unit, bool, list, data, pair } from "../../../Term/Type/base";
import { typeExtends } from "../../../Term/Type/extension";
import { isAliasType, isStructType, isDataType, isListType, isPairType, isConstantableTermType } from "../../../Term/Type/kinds";
import { cloneWithAllPairsAsDynamic, termTypeToString } from "../../../Term/Type/utils";
import unwrapAlias from "../../PAlias/unwrapAlias";
import PBool from "../../PBool";
import PByteString from "../../PByteString";
import PInt from "../../PInt";
import PList from "../../PList";
import PString from "../../PString";
import PUnit from "../../PUnit";
import { pdataPairToDynamic, pdynPair } from "../../PPair/pdynPair";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import ObjectUtils from "../../../../../utils/ObjectUtils";

export function getFromDataTermForType<T extends ConstantableTermType | StructType>( t: T )
: TermFn<[ PData ], ToPType<T>>
{
    if( isAliasType( t ) ) return getFromDataTermForType( unwrapAlias( t ) ) as any;
    if( isStructType( t ) ) return phoist(
        plam( data , t )
        // @ts-ignore Type instantiation is excessively deep and possibly infinite
        ( ( term: Term<PData> ) => punsafeConvertType( term, t ) )
    ) as any;

    if( typeExtends( t, int ) )     return PInt.fromDataTerm as any;
    if( typeExtends( t, bs  ) )     return PByteString.fromDataTerm as any;
    if( typeExtends( t, str ) )     return PString.fromDataTerm as any;
    if( typeExtends( t, unit ) )    return PUnit.fromDataTerm as any;
    if( typeExtends( t, bool ) )    return PBool.fromDataTerm as any;

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

            return pdataPairToDynamic( fstT, sndT )( dataTerm );
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
            return punsafeConvertType( term, dynPair( fstT, sndT ) );
        }) as any;
    }

    /**
     * @todo add proper error
     */
    throw new BasePlutsError(
        "'getFromDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
    );
}