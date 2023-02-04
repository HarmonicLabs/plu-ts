import { PData } from "./PData";
import { PDataList } from "./PDataList";
import { PDataPair } from "./PDataPair";


export type PDataMap<PDataKey extends PData, PDataValue extends PData> = PDataList<PDataPair<PDataKey,PDataValue>>
