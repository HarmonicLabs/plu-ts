import Cloneable from "../../../types/interfaces/Cloneable";
import CEKEnv from "../CEKEnv";

export default class ForceFrame
    implements Cloneable<ForceFrame>
{
    clone(): ForceFrame
    {
        return new ForceFrame();
    }
    
};