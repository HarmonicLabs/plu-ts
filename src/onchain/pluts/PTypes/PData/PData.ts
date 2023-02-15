import { Data } from "../../../../types/Data/Data";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { PType } from "../../PType";

export class PData extends PType
{
    protected _data: Data
    get data(): Data { return this._data; }

    constructor( data: Data = new DataConstr( 0, [] ) )
    {
        super();

        this._data = data;
    }
}