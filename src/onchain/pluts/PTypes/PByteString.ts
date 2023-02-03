import { ByteString } from "../../../types/HexString/ByteString";
import { UPLCConst } from "../../UPLC/UPLCTerms/UPLCConst";
import { PDataRepresentable } from "../PType/PDataRepresentable";
import { pBSToData, punBData } from "../stdlib/Builtins";
import { TermBS, addPByteStringMethods } from "../stdlib/UtilityTerms/TermBS";
import { Term } from "../Term";
import { Type, TermType } from "../Term/Type/base";
import { PData } from "./PData/PData";
import { PDataBS } from "./PData/PDataBS";
import { PLam } from "./PFn/PLam";

//@ts-ignore
export class PByteString extends PDataRepresentable
{
    private _pbytestring: ByteString

    constructor( bs: ByteString = new ByteString( "" ) )
    {
        super();
        this._pbytestring = bs;
    }

    static override get termType(): TermType { return Type.BS }
    static override get fromDataTerm(): Term<PLam<PData, PByteString>> & { $: (input: Term<PData>) => Term<PByteString>; }
    {
        return punBData;
    }
    /**
     * @deprecated try to use 'fromDataTerm.$'
     */
    static override get fromData(): (data: Term<PDataBS>) => TermBS
    {
        return (data: Term<PDataBS>) => addPByteStringMethods( punBData.$( data ) )
    }

    static override get toDataTerm(): Term<PLam<PByteString, PData>> & { $: (input: Term<PByteString>) => Term<PData>; }
    {
        return pBSToData;
    }
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
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