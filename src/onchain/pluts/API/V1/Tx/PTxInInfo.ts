import pstruct from "../../../PTypes/PStruct";
import PTxOut from "./PTxOut";
import PTxOutRef from "./PTxOutRef";

const PTxInInfo = pstruct({
    PTxInInfo: {
        outRef: PTxOutRef.type,
        resolved: PTxOut.type
    }
})

export default PTxInInfo;