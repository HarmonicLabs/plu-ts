import pstruct from "../../../PTypes/PStruct";
import PScriptPurpose from "./PScriptPurpose";
import PTxInfo from "./PTxInfo";

const PScriptContext = pstruct({
    PScriptContext: {
        txInfo: PTxInfo.type,
        purpose: PScriptPurpose.type
    }
});

export default PScriptContext;