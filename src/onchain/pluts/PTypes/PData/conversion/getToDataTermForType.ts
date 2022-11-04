import PData from "..";
import BasePlutsError from "../../../../../errors/BasePlutsError";
import { ppairData, pfstPair } from "../../../stdlib/Builtins";
import { pmap } from "../../../stdlib/List";
import { phoist, plam } from "../../../Syntax";
import punsafeConvertType from "../../../Syntax/punsafeConvertType";
import Term from "../../../Term";
import Type, { ConstantableTermType, StructType, ToPType, int, bs, str, unit, bool, list, data, pair } from "../../../Term/Type";
import { typeExtends } from "../../../Term/Type/extension";
import { isAliasType, isStructType, isDataType } from "../../../Term/Type/kinds";
import { termTypeToString } from "../../../Term/Type/utils";
import unwrapAlias from "../../PAlias/unwrapAlias";
import PBool from "../../PBool";
import PByteString from "../../PByteString";
import { TermFn } from "../../PFn/PLam";
import PInt from "../../PInt";
import PList from "../../PList";
import PString from "../../PString";
import PUnit from "../../PUnit";


export function getToDataTermForType<T extends ConstantableTermType | StructType>( t: T )
: TermFn<[ ToPType<T> ], PData>
{
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

if( typeExtends( t, list( Type.Any ) ) )
{
    if( isDataType( t[1] ) ) return PList.toDataTerm as any;

    return pmap( t[1] as any , data ).$( getToDataTermForType( t ) ) as any
}

if( typeExtends( t, pair( Type.Any, Type.Any ) ) )
{
    if(
        isDataType( t[1] ) &&
        isDataType( t[2] )
    ) return phoist(
        plam( t, Type.Data.Pair( t[1], t[2] ) )
        ( ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Constr ) )
    );

    return plam( t, Type.Data.Pair( data, data ) )
    (
        ( term: Term<ToPType<T>> ) => 
        ppairData( data, data )
        .$(
            getToDataTermForType( t[1] as any )
            .$( pfstPair( t[1] as any, Type.Any ).$( term as any ) ) 
        ).$(
            getToDataTermForType( t[1] as any )
            .$( pfstPair( Type.Any, t[2] as any ).$( term as any ) )
        ) as any
    )
}

throw new BasePlutsError(
    "'getToDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
);
}


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
        if( isDataType( t[1] ) ) return PList.toData as any;

        return ( term: Term<ToPType<T>> ) => PList.toData(
            pmap( t[1] as any , data ).$( getToDataTermForType( t[1] as any ) ).$( term as any)
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