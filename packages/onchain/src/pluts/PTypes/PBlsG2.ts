import { BlsG2 } from "@harmoniclabs/crypto";
import { PType } from "../PType";

export class PBlsG2 extends PType
{
    private _pblsg2: BlsG2

    constructor( bs: BlsG2 )
    {
        super();
        this._pblsg2 = bs;
    }
}