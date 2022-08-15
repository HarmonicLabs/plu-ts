import Data, { isData } from ".";
import JsRuntime from "../../utils/JsRuntime";
import Cloneable from "../interfaces/Cloneable";


export type DataPair = [Data,Data];

export default class DataMap
    implements Cloneable<DataMap>
{
    private _map: DataPair[];
    get map(): DataPair[] { return this._map.map( pair => [ pair[0].clone(), pair[1].clone() ] ) };

    constructor( map: DataPair[] )
    {
        JsRuntime.assert(
            map.every( entry => {
                return (
                    Array.isArray( entry ) && entry.length === 2 &&
                    isData( entry[0] ) && isData( entry[1] )
                )
            }),
            "invalid map passed to constructor"
        );

        this._map = map;
    }

    clone(): DataMap
    {
        return new DataMap(
            this._map.map( pair => [ pair[0].clone(), pair[1].clone() ] )
        );
    }
}