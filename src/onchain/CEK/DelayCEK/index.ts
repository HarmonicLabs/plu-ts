import { Cloneable } from "../../../types/interfaces/Cloneable";
import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { CEKEnv } from "../CEKEnv";

export class DelayCEK
    implements Cloneable<DelayCEK>
{
    public delayedTerm: UPLCTerm;
    public env: CEKEnv;

    constructor( delayedTerm: UPLCTerm, env: CEKEnv )
    {
        this.delayedTerm = delayedTerm;
        this.env = env;
    }

    clone(): DelayCEK
    {
        return new DelayCEK( Object.freeze( this.delayedTerm ), this.env.clone() );
    }
}