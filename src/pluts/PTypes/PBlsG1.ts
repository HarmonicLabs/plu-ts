import { BlsG1 } from "@harmoniclabs/crypto";
import { PType } from "../PType";

export class PBlsG1 extends PType
{
    private _pblsg1: BlsG1

    constructor( bs: BlsG1 )
    {
        super();
        this._pblsg1 = bs;
    }
}