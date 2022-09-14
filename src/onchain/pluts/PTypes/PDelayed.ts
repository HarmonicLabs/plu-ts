import BasePlutsError from "../../../errors/BasePlutsError";
import Cloneable, { isCloneable } from "../../../types/interfaces/Cloneable";
import PType from "../PType";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import PData from "./PData";

export default class PDelayed< DelayedPType extends PType > extends PType
    implements Cloneable<PDelayed<DelayedPType>>
{
    private _delayedPType: DelayedPType;

    constructor( toDelay: DelayedPType = new PType as DelayedPType )
    {
        super();
        this._delayedPType = toDelay;
    }

    clone(): PDelayed<DelayedPType>
    {
        return new PDelayed(
            isCloneable( this._delayedPType ) ? 
                this._delayedPType.clone() : 
                this._delayedPType
        );
    }

    static override get termType(): TermType { return Type.Delayed( Type.Any ) }
    /**
     * @deprecated
     * do not use
     * here only to ovverride 'PType' static method; which also shouldn't be used
     * 
     * ```PDelayed``` is not a ```PType``` representable in terms of ```Data```
     */
    static override get fromData(): (data: Term<PData>) => Term<PDelayed<PType>> {
        throw new BasePlutsError(
            "delayed term cannot be obtained form data"
        )
    }
}