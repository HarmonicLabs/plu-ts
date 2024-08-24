import { BlsResult } from "@harmoniclabs/crypto";
import { PType } from "../PType";

export class PBlsMlRes extends PType
{
    private _pblsRes: BlsResult

    constructor( bs: BlsResult )
    {
        super();
        this._pblsRes = bs;
    }
}