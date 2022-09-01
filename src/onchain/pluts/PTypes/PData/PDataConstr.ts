import PData from ".";
import DataConstr from "../../../../types/Data/DataConstr";

export default class PDataConstr extends PData
{
    constructor( dConstr: DataConstr = new DataConstr( 0, [] ) )
    {
        super( dConstr );
    }
}