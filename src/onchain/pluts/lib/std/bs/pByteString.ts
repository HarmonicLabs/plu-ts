import { ByteString } from "../../../../../types/HexString/ByteString";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { Term } from "../../../Term";
import { bs } from "../../../type_system/types";
import { TermBS, addPByteStringMethods } from "../UtilityTerms/TermBS";

export function pByteString( _bs: ByteString | string | Uint8Array ): TermBS
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