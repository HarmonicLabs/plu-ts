import Data from "../../../types/Data";
import DataConstr from "../../../types/Data/DataConstr";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import Term from "../Term";

export default class PData extends PType
{
    private _data: Data
    get data(): Data { return this._data; }

    constructor( data: Data = new DataConstr( 0, [] ) )
    {
        super();

        this._data = data;
    }

    static override get default(): PData { return new PData() }
}

export function pData( data: Data ): Term<PData>
{
    return new Term<PData>( dbn => UPLCConst.data( data ), new PData() )
}