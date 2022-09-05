import PData from ".";
import DataConstr from "../../../../types/Data/DataConstr";
import { PDataToDataArr } from "./conversion";

export default class PDataConstr<ArgsPDataTypes extends PData[]> extends PData
{
    constructor(
        dConstr: DataConstr<PDataToDataArr<ArgsPDataTypes>>
            = new DataConstr<PDataToDataArr<ArgsPDataTypes>>( 0, [] as any )
    )
    {
        super( dConstr );
    }
}