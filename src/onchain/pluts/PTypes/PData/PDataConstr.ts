import { PData } from "./PData";
import { DataConstr } from "../../../../types/Data/DataConstr";

export class PDataConstr extends PData
{
    constructor(
        dConstr: DataConstr
            = new DataConstr( 0, [] as any )
    )
    {
        super( dConstr );
    }
}