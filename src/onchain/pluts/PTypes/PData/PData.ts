import { Data } from "../../../../types/Data";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst";
import { PType } from "../../PType";
import { Term } from "../../Term";
import { Type } from "../../Term/Type/base";
import { PDataFromData } from "../../lib/std/data/conversion";

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