import { ByteString } from "../../../../../types/HexString/ByteString";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term } from "../../../Term";
import { bs } from "../../../Term/Type";
import { TermBS, addPByteStringMethods } from "../UtilityTerms/TermBS";
import { Buffer } from "buffer";

export function pByteString( _bs: ByteString | string | Buffer ): TermBS
{
    const _bs_ = _bs instanceof ByteString ? _bs.clone() : new ByteString( _bs ); 
    return addPByteStringMethods(
        new Term(
            bs,
            _dbn => UPLCConst.byteString( _bs_ ),
            true, // isConstant
        )
    );
}