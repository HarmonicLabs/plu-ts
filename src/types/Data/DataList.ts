import Data, { isData } from ".";
import JsRuntime from "../../utils/JsRuntime";
import Cloneable from "../interfaces/Cloneable";


export default class DataList
    implements Cloneable<DataList>
{
    private _list: Data[]
    get list(): Data[] { return this._list.map( dataElem => Object.freeze( dataElem ) as any ) };
    
    constructor( list: Data[] )
    {
        JsRuntime.assert(
            list.every( isData ),
            "invalid list passed to constructor"
        );
        
        this._list = list;
    }
    
    clone(): DataList
    {
        return new DataList(
            this._list.map( dataElem => dataElem.clone() )
        );
    }
}