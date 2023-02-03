import { Cloneable } from "../../../types/interfaces/Cloneable";

export class ForceFrame
    implements Cloneable<ForceFrame>
{
    clone(): ForceFrame
    {
        return new ForceFrame();
    }
    
};