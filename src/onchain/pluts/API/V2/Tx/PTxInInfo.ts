import pstruct from "../../../PTypes/PStruct";
import V1PtxOutRef from "../../V1/Tx/PTxOutRef";
import PTxOut from "./PTxOut";

const PTxInInfo = pstruct({
    PTxInInfo: {
        utxoRef: V1PtxOutRef.type,
        resolved: PTxOut.type
    }
});

export default PTxInInfo;