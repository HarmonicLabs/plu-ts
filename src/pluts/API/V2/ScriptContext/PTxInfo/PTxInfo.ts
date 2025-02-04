import { pstruct } from "../../../../PTypes/PStruct/pstruct";
import { PTxInInfo } from "../../Tx/PTxInInfo";
import { PTxOut } from "../../Tx/PTxOut";
import { list, pair, int, data } from "../../../../../type_system";
import { PValue } from "../../../V1/Value/PValue";
import { PDCert } from "../../../V1/PDCert";
import { PStakingCredential } from "../../../V1/Address/PStakingCredential";
import { PPOSIXTimeRange } from "../../../V1/Time";
import { PPubKeyHash } from "../../../V1/PubKey/PPubKeyHash";
import { PScriptPurpose } from "../../../V1/ScriptContext/PScriptPurpose";
import { PDatumHash } from "../../../V1/ScriptsHashes/PDatumHash";
import { PTxId } from "../../../V1/Tx/PTxId";

export const PTxInfo = pstruct({
    PTxInfo: {
        inputs: list( PTxInInfo.type ),
        refInputs: list( PTxInInfo.type ),
        outputs: list( PTxOut.type ),
        fee:  PValue.type,
        mint: PValue.type,
        dCertificates: list( PDCert.type ),
        withdrawals: list( pair( PStakingCredential.type, int ) ),
        interval: PPOSIXTimeRange.type,
        signatories: list( PPubKeyHash.type ),
        redeemers: list( pair( PScriptPurpose.type, data ) ),
        datums: list( pair( PDatumHash.type, data ) ),
        id: PTxId.type
    }
});