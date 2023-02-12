import type { TermFn } from "../../../../PTypes/PFn";
import { PData } from "../../../../PTypes/PData/PData";
import { Term, dynPair, map, tyVar } from "../../../../Term";
import { ConstantableTermType, PrimType, StructType } from "../../../../Term/Type/base";
import type { PType } from "../../../../PType";

import { BasePlutsError } from "../../../../../../errors/BasePlutsError";
import { Type, int, bs, str, unit, bool, list, data } from "../../../../Term/Type/base";
import { typeExtends } from "../../../../Term/Type/extension";
import { isAliasType, isStructType, isDataType, isListType, isPairType } from "../../../../Term/Type/kinds";
import { termTypeToString } from "../../../../Term/Type/utils";
import { unwrapAlias } from "../../../../PTypes/PAlias/unwrapAlias";
import type { PList } from "../../../../PTypes/PList";
import { ToPType } from "../../../../Term/Type/ts-pluts-conversion";
import { pBSToData, pIntToData, pListToData, pMapToData, pencodeUtf8, pfstPair, pid, ppairData, psndPair } from "../../../builtins";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { pmap } from "../../list/pmap";
import { pBoolToData } from "../../bool/pBoolToData";
import { pcompose } from "../../combinators";
import { DataConstr } from "../../../../../../types/Data/DataConstr";
import { pData } from "../pData";
import { Application } from "../../../../../UPLC/UPLCTerms/Application";

export function getToDataTermForType<T extends ConstantableTermType | StructType>( t: T )
: TermFn<[ ToPType<T> ], PData>
{
    if( isDataType( t ) ) return pid( t ) as any;
    if( isAliasType( t ) ) return getToDataTermForType( unwrapAlias( t ) ) as any;
    if( isStructType( t ) ) return phoist(
        plam( t, Type.Data.Constr )
        ( ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Constr ) )
    ) as any;

    if( typeExtends( t, int ) )     return pIntToData as any;
    if( typeExtends( t, bs  ) )     return pBSToData as any;
    if( typeExtends( t, str ) )     return pcompose.$( pBSToData ).$( pencodeUtf8 ) as any;
    if( typeExtends( t, unit ) )    return phoist(
        plam( unit, data )(
            _unit => pData(new DataConstr( 0 , [] ))
        )
    ) as any;
    if( typeExtends( t, bool ) )    return pBoolToData as any;

    if( isListType( t ) )
    {
        const elemsT = t[1];

        if( isDataType( elemsT ) ) return pListToData( data ) as any;

        return plam( list( elemsT ), data ) 
        (( someList: Term<PList<PType>> ) =>
            pListToData( data ).$(
                pmap( elemsT as any , data ).$( getToDataTermForType( elemsT as any ) ).$( someList )
            )
        ) as any;
    }

    // both pair and dynamic pair
    if( isPairType( t ) )
    {
        const fstT = t[1];
        const sndT = t[2];
        
        if(
            isDataType( fstT ) &&
            isDataType( sndT )
        ) return phoist(
            plam( t, Type.Data.Pair( fstT, sndT ) )
            ( ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Constr ) )
        )  as any;

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
        ) as any
    }

    throw new BasePlutsError(
        "'_getToDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
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
    return ( term: Term<any> ) => {
        const isConstant = Boolean((term as any).isConstant);

        const res = _getToDataForType( t )( term );

        (res as any).isConstant = isConstant;

        return res;
    }
}

function _getToDataForType<T extends ConstantableTermType | StructType>( t: T )
    :( term: Term<ToPType<T>> ) => Term<PData>
{
    if( isAliasType( t ) ) return _getToDataForType( unwrapAlias( t ) );
    if(
        typeExtends( t, list( Type.Any ) )
    ){
        const elemsT = t[1];

        const elemToDataTerm = getToDataTermForType( elemsT as any );

        if( isPairType( elemsT ))
        {
            return ( term: Term<ToPType<T>> ) => pMapToData( data, data ).$(
                typeExtends( term.type, map( tyVar(), tyVar() ) ) || typeExtends( term.type, Type.Data.Pair( data, data ) ) ?
                term :
                new Term(
                    list(dynPair( data, data )),
                    dbn => new Application(
                        pmap( elemsT as any, Type.Data.Pair( data, data ) )
                        .$( elemToDataTerm as any )
                        .toUPLC( dbn ),
                        term.toUPLC(dbn)
                    )
                ) as any
             ) as any;
        }

        if( isDataType( t[1] ) ) return ( term: Term<ToPType<T>> ) => pListToData( data ).$( term as any ) as any;


        return ( term: Term<ToPType<T>> ) => pListToData( data ).$(
            pmap( elemsT as any, data ).$( elemToDataTerm ).$( term as any)
        )
    }

    // both pair and dynamic pair
    if( isPairType( t ) )
    {
        if(
            isDataType( t[1] ) &&
            isDataType( t[2] )
        ) return ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Pair( t[1] as any, t[2] as any )) as any;

        if(
            t[0] === PrimType.PairAsData
        ) return ( term: Term<ToPType<T>> ) => punsafeConvertType( term, Type.Data.Pair( data, data ) ) as any;
        
        return ( term: Term<ToPType<T>> ) => 
            ppairData( data, data )
            .$(
                getToDataTermForType( t[1] as any )
                .$( pfstPair( t[1] as any, Type.Any ).$( term as any ) ) 
            ).$(
                getToDataTermForType( t[2] as any )
                .$( psndPair( Type.Any, t[2] as any ).$( term as any ) )
            ) as any
    }

    return ( term: Term<ToPType<T>> ) => getToDataTermForType( t ).$( term )
}