import PData from "./PData";
import DataI from "../../../../types/Data/DataI";
import DataPair from "../../../../types/Data/DataPair";
import { DataFromPData } from "./conversion";

/**
 * @deprecated there's no such thing as data pair; pairs in ```Data``` elements are plain pairs
 */
export default class PDataPair<PDataFst extends PData, PDataSnd extends PData> extends PData // (PData extends PType => PDataList extends PType too)
{
    constructor( dataPair: DataPair<DataFromPData<PDataFst>,DataFromPData<PDataSnd>> = new DataPair( new DataI, new DataI ) as any )
    {
        super( dataPair as any );
    }
}