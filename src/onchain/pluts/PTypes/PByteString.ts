import ByteString from "../../../types/HexString/ByteString";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { pBSToData, punBData } from "../Prelude/Builtins";
import TermBS, { addPByteStringMethods } from "../Prelude/UtilityTerms/TermBS";
import { PDataRepresentable } from "../PType";
import Term from "../Term";
import Type, { TermType } from "../Term/Type";
import PDataBS from "./PData/PDataBS";

export default class PByteString extends PDataRepresentable
{
    private _pbytestring: ByteString

    constructor( bs: ByteString = new ByteString( "" ) )
    {
        super();
        this._pbytestring = bs;
    }

    static override get termType(): TermType { return Type.BS }
    static override get fromData(): (data: Term<PDataBS>) => TermBS
    {
        return (data: Term<PDataBS>) => addPByteStringMethods( punBData.$( data ) )
    }
    static override toData(term: Term<PByteString>): Term<PDataBS>
    {
        return pBSToData.$( term );
    }
}

export function pByteString( bs: ByteString | Buffer | string ): TermBS
{
    const _bs = bs instanceof ByteString ? bs : new ByteString( bs );

    return addPByteStringMethods( new Term<PByteString>(
        Type.BS,
        _dbn => UPLCConst.byteString( _bs ),
        true
    ) );
}