import Data from "../../../../types/Data";
import DataB from "../../../../types/Data/DataB";
import DataConstr from "../../../../types/Data/DataConstr";
import DataI from "../../../../types/Data/DataI";
import DataList from "../../../../types/Data/DataList";
import DataMap from "../../../../types/Data/DataMap";
import DataPair from "../../../../types/Data/DataPair";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import PType from "../../PType";
import Term from "../../Term";
import Type from "../../Term/Type";
import PDataBS from "./PDataBS";
import PDataConstr from "./PDataConstr";
import PDataInt from "./PDataInt";
import PDataList from "./PDataList";
import PDataMap from "./PDataMap";
import PDataPair from "./PDataPair";

export * from "./PDataInt";
export * from "./PDataBS";
export * from "./PDataList";
export * from "./PDataMap";

export type PDataFromData<DataInstance extends Data> = 
    DataInstance extends DataI ? PDataInt :
    DataInstance extends DataB ? PDataBS :
    DataInstance extends DataPair<infer DataFst extends Data, infer DataSnd extends Data> ?
        //@ts-ignore Type instantiation is excessively deep and possibly infinite
        PDataPair<PDataFromData<DataFst>,PDataFromData<DataSnd>> :
    DataInstance extends DataMap<infer DataKey extends Data, infer DataVal extends Data > ?
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

export default class PData extends PType
{
    protected _data: Data
    get data(): Data { return this._data; }

    constructor( data: Data = new DataConstr( 0, [] ) )
    {
        super();

        this._data = data;
    }

    static override get default(): PData { return new PData() }
}

export function pData<DataInstance extends Data>
    ( data: DataInstance )
    : Term<PDataFromData<DataInstance>>
{
    return new Term(
        Type.Data.Int as any, //@fixme; get type based on Data constructor
        _dbn => UPLCConst.data( data )
    );
}