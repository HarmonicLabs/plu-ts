import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, ConstTyTag } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import PType from "../PType";
import Term from "../Term";


export default class PUnit extends PType
{
    private _unit: undefined

    constructor()
    {
        super();
        this._unit = undefined;
    }

    static override get default(): PUnit
    {
        return new PUnit;
    }

    override get ctor(): new () => PUnit { return PUnit };

}