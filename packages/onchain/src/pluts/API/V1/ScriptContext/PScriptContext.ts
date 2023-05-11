import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PScriptPurpose } from "./PScriptPurpose";
import { PTxInfo } from "./PTxInfo/PTxInfo";

export const PScriptContext = pstruct({
    PScriptContext: {
        tx: PTxInfo.type,
        purpose: PScriptPurpose.type
    }
});