import Data, { isData } from ".";
import JsRuntime from "../../utils/JsRuntime";
import Cloneable from "../interfaces/Cloneable";
import DataPair from "./DataPair";


export default class DataMap<DataKey extends Data, DataValue extends Data>
    implements Cloneable<DataMap<DataKey,DataValue>>
{
    private _map: DataPair<DataKey, DataValue>[];
    get map(): DataPair<DataKey, DataValue>[] { return this._map.map( pair => pair.clone() ) };

    constructor( map: DataPair<DataKey, DataValue>[] )
    {
        JsRuntime.assert(
            map.every( entry =>
                Object.getPrototypeOf( entry ) === DataPair.prototype &&
                isData( entry.fst ) && isData( entry.snd )
            ),
            "invalid map passed to 'DataPair' constructor"
        );

        this._map = map;
    }

    clone(): DataMap<DataKey,DataValue>
    {
        return new DataMap(
            this._map.map( pair => pair.clone() )
        );
    }
}