import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { ConstValueList } from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import PType from "../PType";
import Term from "../Term";


export default class PList<A extends PType> extends PType
{
    private _elems: A[];

    constructor( elements: A[] = [] )
    {
        super();

        this._elems = elements
    }

    static override get default(): PList< PType >
    {
        return new PList( [] )    
    }

    override get ctor(): new () => PList<PType> { return PList };

}