import ByteString from "../../../types/HexString/ByteString";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import PType from "../PType";
import Term from "../Term";

export default class PByteString extends PType

{
    private _pbytestring: ByteString

    constructor( bs: ByteString = new ByteString( "" ) )
    {
        super();
        this._pbytestring = bs;
    }

    static override get default(): PByteString
    {
        return new PByteString( new ByteString( "" ) )
    }

}

export function pByteString( bs: ByteString ): Term<PByteString>
{
    return new Term<PByteString>( dbn => UPLCConst.byteString( bs ) , new PByteString( bs ) );
}