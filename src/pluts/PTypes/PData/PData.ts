import { Data, DataConstr } from "@harmoniclabs/plutus-data";
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

export class PAsData<PT extends PType> extends PData
{
    protected _pty: PT

    get pty(): PT { return this._pty; }

    constructor( pty: PT, data: Data = new DataConstr( 0, [] ) )
    {
        super( data );

        this._pty = pty;
    }
}