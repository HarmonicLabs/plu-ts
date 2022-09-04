import PData from "."
import Data from "../../../../types/Data"
import DataB from "../../../../types/Data/DataB"
import DataConstr from "../../../../types/Data/DataConstr"
import DataI from "../../../../types/Data/DataI"
import DataList from "../../../../types/Data/DataList"
import DataMap from "../../../../types/Data/DataMap"
import DataPair from "../../../../types/Data/DataPair"
import PDataBS from "./PDataBS"
import PDataConstr from "./PDataConstr"
import PDataInt from "./PDataInt"
import PDataList from "./PDataList"
import PDataMap from "./PDataMap"

export type PDataFromData<DataInstance extends Data> = 
    DataInstance extends DataI ? PDataInt :
    DataInstance extends DataB ? PDataBS :
    DataInstance extends DataPair<infer DataFst extends Data, infer DataSnd extends Data> ?
        //@ts-ignore Type instantiation is excessively deep and possibly infinite
        PDataPair<PDataFromData<DataFst>,PDataFromData<DataSnd>> :
    DataInstance extends DataMap<infer DataKey extends Data, infer DataVal extends Data > ?
        //@ts-ignore Type instantiation is excessively deep and possibly infinite
        PDataMap< PDataFromData<DataKey>, PDataFromData<DataVal> > :
    DataInstance extends DataList ? PDataList<PData> :
    DataInstance extends DataConstr ? PDataConstr :
    PData

export type DataFromPData<PDataInstance extends PData> = 
    PDataInstance extends PDataInt ? DataI :
    PDataInstance extends PDataBS ? DataB :
    PDataInstance extends PDataMap<infer PDataKey extends PData, infer PDataVal extends PData> ? DataMap<DataFromPData<PDataKey>, DataFromPData<PDataVal>> :
    PDataInstance extends PDataList<PData> ? DataList :
    PDataInstance extends PDataConstr ? DataConstr :
    Data