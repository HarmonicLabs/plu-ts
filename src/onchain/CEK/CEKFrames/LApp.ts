import ObjectUtils from "../../../utils/ObjectUtils";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { PartialBuiltin } from "../BnCEK/PartialBuiltin";

export class LApp
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
            this.func
        );
    }
}