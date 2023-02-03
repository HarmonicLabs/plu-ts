import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { V1 } from "../../V1";
import { PTxOut } from "./PTxOut";

export const PTxInInfo = pstruct({
    PTxInInfo: {
        utxoRef: V1.PTxOutRef.type,
        resolved: PTxOut.type
    }
});