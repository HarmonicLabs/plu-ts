import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { TermType } from "../../pluts";
import { cloneTermType } from "../../pluts/type_system/cloneTermType";
import { IHash } from "../interfaces/IHash";

export class IRConst
    implements Cloneable<IRConst>, IHash
{
    readonly hash: Uint8Array; to do

    readonly type!: TermType

    constructor( t: TermType, v: any )
    {
        ObjectUtils.defineReadOnlyProperty(
            this, "type", cloneTermType( t )
        );

    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0011 ]); }

    clone(): IRConst
    {
        return new IRConst( this.type, this.value );
    }
}