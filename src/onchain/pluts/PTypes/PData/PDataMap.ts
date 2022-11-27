import PData from "./PData";
import Data from "../../../../types/Data";
import DataMap from "../../../../types/Data/DataMap";
import DataPair from "../../../../types/Data/DataPair";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import Term from "../../Term";
import { PDataFromData } from "./conversion";
import PDataList from "./PDataList";
import PDataPair from "./PDataPair";
import Type, { data } from "../../Term/Type/base";


type PDataMap<PDataKey extends PData, PDataValue extends PData> = PDataList<PDataPair<PDataKey,PDataValue>>
export default PDataMap;

export function pDataMap<DataK extends Data, DataV extends Data>
    ( entries: DataPair<DataK,DataV>[] )
    : Term<
        //@ts-ignore Type instantiation is excessively deep and possibly infinite.
        PDataMap<PDataFromData<DataK>,PDataFromData<DataV>>
    >
{
    const dataMap = new DataMap( entries );

    return new Term(
        Type.Data.Map( data, data ),
        _dbn => UPLCConst.data( dataMap )
    );
}