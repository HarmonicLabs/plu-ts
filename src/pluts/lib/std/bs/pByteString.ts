import { ByteString } from "@harmoniclabs/bytestring";
import { IRConst } from "../../../../IR/IRNodes/IRConst";
import { Term } from "../../../Term";
import { bs } from "../../../../type_system/types";
import { TermBS, addPByteStringMethods } from "../UtilityTerms/TermBS";

export function pByteString( _bs: ByteString | string | Uint8Array ): TermBS
{
    const _bs_ = _bs instanceof ByteString ? _bs.clone() : new ByteString( _bs ); 
    return addPByteStringMethods(
        new Term(
            bs,
            _dbn => IRConst.byteString( _bs_ ),
            true, // isConstant
        )
    );
}

export const pBs = pByteString;