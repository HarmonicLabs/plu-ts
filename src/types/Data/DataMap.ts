import Data, { isData } from ".";
import JsRuntime from "../../utils/JsRuntime";
import ToJson from "../../utils/ts/ToJson";
import Cloneable from "../interfaces/Cloneable";
import DataPair from "./DataPair";


export default class DataMap<DataKey extends Data, DataValue extends Data>
    implements Cloneable<DataMap<DataKey,DataValue>>, ToJson
{
    private _map: DataPair<DataKey, DataValue>[];
    get map(): DataPair<DataKey, DataValue>[] { return this._map.map( pair => Object.freeze( pair ) as any ) };

    constructor( map: DataPair<DataKey, DataValue>[] )
    {
        JsRuntime.assert(
            map.every( entry =>
                Object.getPrototypeOf( entry ) === DataPair.prototype &&
                isData( entry.fst ) && isData( entry.snd )
            ),
            "invalid map passed to 'DataPair' constructor"
        );

        this._map = map.map( pair => pair.clone() );
    }

    clone(): DataMap<DataKey,DataValue>
    {
        return new DataMap(
            this._map
            //.map( pair => pair.clone() )
            // the constructor clones the map
        );
    }

    toJson(): { map: ({ k: any, v: any })[] }
    {
        return {
            map: this._map.map( ({ fst, snd }) =>
                ({
                    k: fst.toJson(),
                    v: snd.toJson()
                })
            )
        }
    }
}