import type { ByteString } from "../../../types/HexString/ByteString";
import { PDataRepresentable } from "../PType/PDataRepresentable";
import { Type, TermType } from "../Term/Type/base";

export class PByteString extends PDataRepresentable
{
    private _pbytestring: ByteString

    constructor( bs: ByteString )
    {
        super();
        this._pbytestring = bs;
    }

    static override get termType(): TermType { return Type.BS }
    
}