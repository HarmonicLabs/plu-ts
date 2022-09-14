import ByteString from "../../../types/HexString/ByteString";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { punBData } from "../Prelude/Builtins";
import TermBS, { addPByteStringMethods } from "../Prelude/TermBS";
import PType from "../PType";
import Term from "../Term";
import Type, { Type as Ty } from "../Term/Type";
import PDataBS from "./PData/PDataBS";

export default class PByteString extends PType
{
    private _pbytestring: ByteString

    constructor( bs: ByteString = new ByteString( "" ) )
    {
        super();
        this._pbytestring = bs;
    }

    static override get termType(): Ty { return Type.BS }
    static override get fromData(): (data: Term<PDataBS>) => TermBS {
        return (data: Term<PDataBS>) => addPByteStringMethods( punBData.$( data ) )
    }
}

export function pByteString( bs: ByteString ): Term<PByteString>
{
    return new Term<PByteString>(
        Type.BS,
        _dbn => UPLCConst.byteString( bs ),
        true
    );
}