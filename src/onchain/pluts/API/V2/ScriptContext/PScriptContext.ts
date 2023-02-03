import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { V1 } from "../../V1";
import { PTxInfo } from "./PTxInfo/PTxInfo";

export const PScriptContext = pstruct({
    PScriptContext: {
        txInfo: PTxInfo.type,
        purpose: V1.PScriptPurpose.type
    }
});