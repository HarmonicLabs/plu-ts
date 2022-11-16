import Cloneable from "../../../types/interfaces/Cloneable";
import UPLCTerm from "../../UPLC/UPLCTerm";
import CEKEnv from "../CEKEnv";

export default class LambdaCEK
    implements Cloneable<LambdaCEK>
{
    public body: UPLCTerm;
    public env: CEKEnv;

    constructor( body: UPLCTerm, env: CEKEnv )
    {
        this.body = body;
        this.env = env;
    }

    clone(): LambdaCEK
    {
        return new LambdaCEK( Object.freeze( this.body ), this.env.clone() );
    }
}