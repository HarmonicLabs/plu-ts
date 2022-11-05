import pstruct from "../../../PTypes/PStruct/pstruct";
import PScriptPurpose from "./PScriptPurpose";
import PTxInfo from "./PTxInfo/PTxInfo";

const PScriptContext = pstruct({
    PScriptContext: {
        txInfo: PTxInfo.type,
        purpose: PScriptPurpose.type
    }
});

export default PScriptContext;