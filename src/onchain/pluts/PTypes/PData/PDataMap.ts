import PData, { DataFromPData } from ".";
import DataI from "../../../../types/Data/DataI";
import DataMap from "../../../../types/Data/DataMap";
import DataPair from "../../../../types/Data/DataPair";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { pMapToData, punMapData } from "../../Builtins";
import Term from "../../Term";
import { PMap } from "../PPair";
import PDataList from "./PDataList";
import PDataPair from "./PDataPair";


type PDataMap<PDataKey extends PData, PDataValue extends PData> = PDataList<PDataPair<PDataKey,PDataValue>>
export default PDataMap;

export function pDataMap<PDataKey extends PData, PDataValue extends PData>
    ( entries: DataPair<DataFromPData<PDataKey>, DataFromPData<PDataValue>>[] ): Term<PDataMap<PDataKey,PDataValue>>
{
    return new Term(
        _dbn => UPLCConst.data( new DataMap( entries ) ),
        new PDataList([ new DataPair( new DataI, new DataI ) as any ])
    );
}

export const ptoDataMap = pMapToData;

export function pMapFromData<PDataKey extends PData,PDataValue extends PData>
    ( dataMapTerm: Term<PDataMap<PDataKey,PDataValue>> ): Term<PMap<PDataKey,PDataValue>>
{
    /*
     * 'PData' is assignable to the constraint of type 'PDataKey',
     * but 'PDataKey' could be instantiated with a different subtype of constraint 'PData'
     */
    return punMapData().$( dataMapTerm ) as Term<PMap<PDataKey,PDataValue>> ;
}