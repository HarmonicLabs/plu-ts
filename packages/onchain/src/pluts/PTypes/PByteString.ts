import { ByteString } from "@harmoniclabs/bytestring";
import { PDataRepresentable } from "../PType/PDataRepresentable";

export class PByteString extends PDataRepresentable
{
    private _pbytestring: ByteString

    constructor( bs: ByteString )
    {
        super();
        this._pbytestring = bs;
    }
}