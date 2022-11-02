import PData from ".."
import BasePlutsError from "../../../../../errors/BasePlutsError"
import Data, { isData } from "../../../../../types/Data"
import DataB from "../../../../../types/Data/DataB"
import DataConstr from "../../../../../types/Data/DataConstr"
import DataI from "../../../../../types/Data/DataI"
import DataList from "../../../../../types/Data/DataList"
import DataMap from "../../../../../types/Data/DataMap"
import DataPair from "../../../../../types/Data/DataPair"
import JsRuntime from "../../../../../utils/JsRuntime"
import { pfstPair, ppairData } from "../../../stdlib/Builtins"
import { pmap } from "../../../stdlib/List"
import { phoist, plam, punsafeConvertType } from "../../../Syntax"
import Term from "../../../Term"
import Type, { anyStruct, bool, bs, ConstantableTermType, data, DataType, int, list, pair, str, struct, StructType, TermType, ToPType, tyVar, unit } from "../../../Term/Type"
import { typeExtends } from "../../../Term/Type/extension"
import { isAliasType, isConstantableStructDefinition, isConstantableStructType, isConstantableTermType, isDataType, isStructType } from "../../../Term/Type/kinds"
import { termTypeToString } from "../../../Term/Type/utils"
import { unwrapAlias } from "../../PAlias"
import PBool from "../../PBool"
import PByteString from "../../PByteString"
import { TermFn } from "../../PFn/PLam"
import PInt from "../../PInt"
import PList, { pDataList } from "../../PList"
import PPair from "../../PPair"
import PString from "../../PString"
import { PStruct } from "../../PStruct"
import PUnit from "../../PUnit"
import PDataBS from "../PDataBS"
import PDataConstr from "../PDataConstr"
import PDataInt from "../PDataInt"
import PDataList from "../PDataList"
import PDataMap from "../PDataMap"

export type PDataFromData<DataInstance extends Data> = 
    DataInstance extends DataI ? PDataInt :
    DataInstance extends DataB ? PDataBS :
    DataInstance extends DataPair<infer DataFst extends Data, infer DataSnd extends Data> ?
        //@ts-ignore Type instantiation is excessively deep and possibly infinite
        PPair<PDataFromData<DataFst>,PDataFromData<DataSnd>> :
    DataInstance extends DataMap<infer DataKey extends Data, infer DataVal extends Data > ?
        //@ts-ignore Type instantiation is excessively deep and possibly infinite
        PDataMap< PDataFromData<DataKey>, PDataFromData<DataVal> > :
    DataInstance extends DataList ? PDataList<PData> :
    DataInstance extends DataConstr ? PDataConstr :
    PData

export type DataToPData<DataInstance extends Data> = PDataFromData<DataInstance>

export type PDataToData<PDataInstance extends PData> = 
    PDataInstance extends PDataInt ? DataI :
    PDataInstance extends PDataBS ? DataB :
    PDataInstance extends PDataMap<infer PDataKey extends PData, infer PDataVal extends PData> ? DataMap<PDataToData<PDataKey>, PDataToData<PDataVal>> :
    PDataInstance extends PDataList<PData> ? DataList :
    PDataInstance extends PDataConstr ? DataConstr :
    Data

export type DataFromPData<PDataInstance extends PData> = PDataToData<PDataInstance>

export type PDataToDataArr<PDataArr extends PData[]> =
    PDataArr extends [] ? [] & Data[] :
    PDataArr extends [ infer PDataInstance extends PData ] ? [ PDataToData<PDataInstance> ] :
    PDataArr extends [ infer PDataInstance extends PData, ...infer RestPData extends PData[] ] ? [ PDataToData<PDataInstance> , PDataToDataArr<RestPData> ] :
    never;

export type PDataFromDataArr<DataArr extends Data[]> =
    DataArr extends [] ? [] & PData[] :
    DataArr extends [infer DataInstance extends Data] ? [ PDataFromData<DataInstance> ] :
    DataArr extends [infer DataInstance extends Data, ...infer RestData extends Data[] ] ? [ PDataFromData<DataInstance>, PDataFromDataArr<RestData> ] :
    never;


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

export function getFromDataForType<T extends ConstantableTermType | StructType>( t: T )
    :( term: Term<PData> ) => Term<ToPType<T>>
{
    if( !isConstantableTermType( t ) )
    {
        /**
         * @todo add proper error
         */
        throw new BasePlutsError(
            "'getFromDataForType'; type '" + termTypeToString( t ) + "' cannot be converted from data"
        );
    }
    if( isDataType( t ) )           return ((x: Term<PData>) => x) as any;
    if( typeExtends( t, int ) )     return PInt.fromData as any;
    if( typeExtends( t, bs  ) )     return PByteString.fromData as any;
    if( typeExtends( t, str ) )     return PString.fromData as any;
    if( typeExtends( t, unit ) )    return PUnit.fromData as any;
    if( typeExtends( t, bool ) )    return PBool.fromData as any;

    const extendsConstData = ( _t: any ): boolean =>
        isDataType( _t ) || isConstantableStructType( _t );

    if( typeExtends( t, list( Type.Any ) ) )
    {
        if( isDataType( t[1] ) ) return PList.fromData as any;
        if( isConstantableStructType( t[1] as any ) )
        {
            return ( x: Term<PData> ) => punsafeConvertType( PList.fromData( x ), list( t[1] ) ) as any
        }
    }

    if(
        typeExtends( t, pair( Type.Any, Type.Any ) ) &&
        extendsConstData( t[1] ) &&
        extendsConstData( t[2] )
    )                               return PPair.fromData as any;
    if(
        typeExtends( t, struct( anyStruct ) ) &&
        ( t[1] as any) !== anyStruct && isConstantableStructDefinition( t[1] )
    ) return ( ( structData: Term<PStruct<any>> ) => punsafeConvertType( structData, struct( t[1] ) ) ) as any;

    /**
     * @todo add proper error
     */
    throw new BasePlutsError(
        "'getFromDataForType'; type '" + termTypeToString( t ) + "' cannot be converted from data"
    );
}