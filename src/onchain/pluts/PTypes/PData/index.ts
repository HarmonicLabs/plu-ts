import Data from "../../../../types/Data";
import DataConstr from "../../../../types/Data/DataConstr";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import PType from "../../PType";
import Term from "../../Term";
import Type from "../../Term/Type";
import { PDataFromData } from "./conversion";


export default class PData extends PType
{
    protected _data: Data
    get data(): Data { return this._data; }

    constructor( data: Data = new DataConstr( 0, [] ) )
    {
        super();

        this._data = data;
    }
}

export function pData<DataInstance extends Data>
    ( data: DataInstance )
    //@ts-ignore Type instantiation is excessively deep and possibly infinite
    : Term<PDataFromData<DataInstance>>
{
    return new Term(
        Type.Data.Any as any, //@fixme; get type based on Data constructor
        _dbn => UPLCConst.data( data )
    );
}