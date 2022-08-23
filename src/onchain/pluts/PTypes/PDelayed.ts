import Cloneable, { isCloneable } from "../../../types/interfaces/Cloneable";
import PType from "../PType";

export default class PDelayed< DelayedPType extends PType > extends PType
    implements Cloneable<PDelayed<DelayedPType>>
{
    private _delayedPType: DelayedPType;

    constructor( toDelay: DelayedPType = new PType as DelayedPType )
    {
        super();
        this._delayedPType = toDelay;
    }

    static override get default(): PType
    {
        return new PDelayed( new PType );
    }

    clone(): PDelayed<DelayedPType>
    {
        return new PDelayed(
            isCloneable( this._delayedPType ) ? 
                this._delayedPType.clone() : 
                this._delayedPType
        );
    }
}