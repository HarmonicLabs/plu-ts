import { punMapData } from "../stdlib/Builtins";
import PType from "../PType";
import Term from "../Term";
import Type from "../Term/Type/base";
import PData from "./PData/PData";
import PDataMap from "./PData/PDataMap";
import PList from "./PList";
import PPair from "./PPair";

export class PMap<PKey extends PType, PValue extends PType> extends PList<PPair<PKey,PValue>>
{
    constructor(){ super(); }

    static override get fromData():
        <PDataFst extends PData, PDataSnd extends PData>
        (data: Term<PDataMap<PDataFst,PDataSnd>>) => Term<PMap<PDataFst, PDataSnd>>
    {
        return <PDataFst extends PData, PDataSnd extends PData>(data: Term<PDataMap<PDataFst,PDataSnd>>) => {
            return punMapData( Type.Data.Any, Type.Data.Any ).$( data ) as any;
        }
    }
}