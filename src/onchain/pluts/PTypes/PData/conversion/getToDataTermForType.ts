import type { TermFn } from "../../PFn";
import type PData from "../PData";
import type Term from "../../../Term";
import type { ConstantableTermType, StructType, ToPType} from "../../../Term/Type/base";
import type PType from "../../../PType";

import BasePlutsError from "../../../../../errors/BasePlutsError";
import { ppairData, pfstPair, psndPair, pid } from "../../../stdlib/Builtins";
import { pmap } from "../../../stdlib/List/methods";
import { phoist, plam } from "../../../Syntax/syntax";
import punsafeConvertType from "../../../Syntax/punsafeConvertType";
import Type, { int, bs, str, unit, bool, list, data, pair } from "../../../Term/Type/base";
import { typeExtends } from "../../../Term/Type/extension";
import { isAliasType, isStructType, isDataType, isListType } from "../../../Term/Type/kinds";
import { termTypeToString } from "../../../Term/Type/utils";
import unwrapAlias from "../../PAlias/unwrapAlias";
import PBool from "../../PBool";
import PByteString from "../../PByteString";
import PInt from "../../PInt";
import PList from "../../PList";
import PString from "../../PString";
import PUnit from "../../PUnit";

export function getToDataTermForType<T extends ConstantableTermType | StructType>( t: T )
: TermFn<[ ToPType<T> ], PData>
{
    if( isDataType( t ) ) return pid( t );
    if( isAliasType( t ) ) return getToDataTermForType( unwrapAlias( t ) ) as any;
    if( isStructType( t ) ) return phoist(
        plam( t, Type.Data.Constr )
        ( ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Constr ) )
    );

    if( typeExtends( t, int ) )     return PInt.toDataTerm;
    if( typeExtends( t, bs  ) )     return PByteString.toDataTerm as any;
    if( typeExtends( t, str ) )     return PString.toDataTerm as any;
    if( typeExtends( t, unit ) )    return PUnit.toDataTerm as any;
    if( typeExtends( t, bool ) )    return PBool.toDataTerm as any;

    if( isListType( t ) )
    {
        const elemsT = t[1];

        if( isDataType( elemsT ) ) return PList.toDataTerm as any;

        // TODO: this can be optimized (probably a lot)
        return plam( list( elemsT ), data ) 
        (( someList: Term<PList<PType>> ) =>
            PList.toDataTerm.$(
                pmap( elemsT as any , data ).$( getToDataTermForType( elemsT as any ) ).$( someList )
            )
        ) as any;
    }

    if( typeExtends( t, pair( Type.Any, Type.Any ) ) )
    {
        const fstT = t[1];
        const sndT = t[2];
        
        if(
            isDataType( fstT ) &&
            isDataType( sndT )
        ) return phoist(
            plam( t, Type.Data.Pair( fstT, sndT ) )
            ( ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Constr ) )
        );

        return plam( t, Type.Data.Pair( data, data ) )
        (
            ( term: Term<ToPType<T>> ) => 
            ppairData( data, data )
            .$(
                getToDataTermForType( fstT as any )
                .$( pfstPair( fstT as any, sndT as any ).$( term as any ) ) 
            ).$(
                getToDataTermForType( sndT as any )
                .$( psndPair( fstT as any, sndT as any ).$( term as any ) )
            ) as any
        )
    }

    throw new BasePlutsError(
        "'getToDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
    );
}

/*

export function inferDataValueType( dataValue: Data ): DataType
{
    JsRuntime.assert(
        isData( dataValue ),
        "cannot infer 'DataType' from a value that is not an instance of 'Data'"
    );

    if( dataValue instanceof DataConstr ) return Type.Data.Constr;
    if( dataValue instanceof DataMap )
    {
        const listOfPairs = dataValue.map;
        if( listOfPairs.length === 0 ) return Type.Data.Map( Type.Data.Any,Type.Data.Any );
        return Type.Data.Map( inferDataValueType( listOfPairs[0].fst ), inferDataValueType( listOfPairs[0].snd ) )
    }
    if( dataValue instanceof DataList ) 
    {
        const list = dataValue.list;
        if( list.length === 0 ) return Type.Data.List( Type.Data.Any );
        return Type.Data.List( inferDataValueType( list[0] ) );
    }
    if( dataValue instanceof DataPair ) return Type.Data.Pair( inferDataValueType( dataValue.fst ), inferDataValueType( dataValue.snd ) );
    if( dataValue instanceof DataI ) return Type.Data.Int;
    if( dataValue instanceof DataB ) return Type.Data.BS;

    throw JsRuntime.makeNotSupposedToHappenError(
        "'inferDataValueType' did not match any possible 'Data' constructor"
    );
}

if( isConstantableStructType( t[1] as any ) )
{
    return ( x: Term<PData> ) => punsafeConvertType( PList.fromData( x ), list( t[1] ) ) as any
}
//*/

export function getToDataForType<T extends ConstantableTermType | StructType>( t: T )
    :( term: Term<ToPType<T>> ) => Term<PData>
{
    if( isAliasType( t ) ) return getToDataForType( unwrapAlias( t ) );
    if( isStructType( t ) ) return ( ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Constr ) );

    if( typeExtends( t, int ) )     return PInt.toData as any;
    if( typeExtends( t, bs  ) )     return PByteString.toData as any;
    if( typeExtends( t, str ) )     return PString.toData as any;
    if( typeExtends( t, unit ) )    return PUnit.toData as any;
    if( typeExtends( t, bool ) )    return PBool.toData as any;
    
    if(
        typeExtends( t, list( Type.Any ) )
    ){
        const elemsT = t[1];
        if( isDataType( t[1] ) ) return PList.toData as any;

        const elemToDataTerm = getToDataTermForType( elemsT as any );

        return ( term: Term<ToPType<T>> ) => PList.toData(
            pmap( elemsT as any, data ).$( elemToDataTerm ).$( term as any)
        )
    }

    if( typeExtends( t, pair( Type.Any , Type.Any ) ) )
    {
        if(
            isDataType( t[1] ) &&
            isDataType( t[2] )
        ) return ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Pair( t[1] as any, t[2] as any ))  as any;

        return ( term: Term<ToPType<T>> ) => 
            ppairData( data, data )
            .$(
                getToDataTermForType( t[1] as any )
                .$( pfstPair( t[1] as any, Type.Any ).$( term as any ) ) 
            ).$(
                getToDataTermForType( t[1] as any )
                .$( pfstPair( Type.Any, t[2] as any ).$( term as any ) )
            ) as any
    }

    /**
     * @todo add proper error
     */
    throw new BasePlutsError(
        "'getToDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
    );
}