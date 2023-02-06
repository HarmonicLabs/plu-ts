import JsRuntime from "../../utils/JsRuntime";

import { Data, isData } from "./Data";
import { ToJson } from "../../utils/ts/ToJson";
import { Cloneable } from "../interfaces/Cloneable";


export class DataList
    implements Cloneable<DataList>, ToJson
{
    private _list: Data[]
    get list(): Data[] { return this._list.map( dataElem => Object.freeze( dataElem ) as any ) };
    
    constructor( list: Data[] )
    {
        JsRuntime.assert(
            list.every( isData ),
            "invalid list passed to constructor"
        );
        
        this._list = list.map( dataElem => dataElem.clone() );
    }
    
    clone(): DataList
    {
        return new DataList(
            this._list
            //.map( dataElem => dataElem.clone() )
            // the constructor clones the list
        );
    }

    toJson(): { list: any[] }
    {
        return {
            list: this._list.map( elem => elem.toJson() )
        }
    }
}