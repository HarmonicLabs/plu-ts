import PData from "../PData"
import BasePlutsError from "../../../../../errors/BasePlutsError"
import Data, { isData } from "../../../../../types/Data"
import DataB from "../../../../../types/Data/DataB"
import DataConstr from "../../../../../types/Data/DataConstr"
import DataI from "../../../../../types/Data/DataI"
import DataList from "../../../../../types/Data/DataList"
import DataMap from "../../../../../types/Data/DataMap"
import DataPair from "../../../../../types/Data/DataPair"
import JsRuntime from "../../../../../utils/JsRuntime"
import punsafeConvertType from "../../../Syntax/punsafeConvertType"
import Term from "../../../Term"
import Type, { anyStruct, bool, bs, ConstantableTermType, data, DataType, int, list, pair, str, struct, StructType, TermType, ToPType, tyVar, unit } from "../../../Term/Type/base"
import { typeExtends } from "../../../Term/Type/extension"
import { isAliasType, isConstantableStructDefinition, isConstantableStructType, isConstantableTermType, isDataType, isStructType } from "../../../Term/Type/kinds"
import { termTypeToString } from "../../../Term/Type/utils"
import PBool from "../../PBool"
import PByteString from "../../PByteString"
import PInt from "../../PInt"
import PList from "../../PList"
import PPair from "../../PPair"
import PString from "../../PString"
import { PStruct } from "../../PStruct/pstruct"
import PUnit from "../../PUnit"
import PDataBS from "../PDataBS"
import PDataConstr from "../PDataConstr"
import PDataInt from "../PDataInt"
import PDataList from "../PDataList"
import PDataMap from "../PDataMap"
import unwrapAlias from "../../PAlias/unwrapAlias"

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

