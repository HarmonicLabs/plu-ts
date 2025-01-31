import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PTxOut } from "./PTxOut";
import { PTxOutRef } from "./PTxOutRef";

export const PTxInInfo = pstruct({
    PTxInInfo: {
        utxoRef: PTxOutRef.type,
        resolved: PTxOut.type
    }
});