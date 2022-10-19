import Cloneable from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";
import PartialBuiltin from "../BnCEK/PartialBuiltin";

export default class LApp
    implements Cloneable<LApp>
{
    readonly func!: UPLCTerm;
    constructor( func: UPLCTerm | PartialBuiltin )
    {
        ObjectUtils.defineReadOnlyProperty(
            this,
            "func",
            func
        )
    }
    clone(): LApp
    {
        return new LApp(
            this.func.clone()
        );
    }
}