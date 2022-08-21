import PType from "../PType";

export default class PDelayed< DelayedPType extends PType > extends PType
{
    //phantom
    private _delayedPType?: DelayedPType;
}