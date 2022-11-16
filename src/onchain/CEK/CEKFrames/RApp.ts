import Cloneable from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import UPLCTerm from "../../UPLC/UPLCTerm";
import CEKEnv from "../CEKEnv";

export default class RApp
    implements Cloneable<RApp>
{
    readonly arg!: UPLCTerm;
    readonly env: CEKEnv;
    
    constructor( arg: UPLCTerm, env: CEKEnv )
    {
        ObjectUtils.defineReadOnlyProperty(
            this,
            "arg",
            arg
        );

        this.env = env;
    }

    clone(): RApp
    {
        return new RApp(
            this.arg,
            this.env.clone()
        );
    }
}