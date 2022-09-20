import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";
import PartialBuiltin from "../BnCEK/PartialBuiltin";

export default class LApp
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
}