import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";

export default class RApp
{
    readonly arg!: UPLCTerm;
    constructor( arg: UPLCTerm )
    {
        ObjectUtils.defineReadOnlyProperty(
            this,
            "arg",
            arg
        )
    }
}