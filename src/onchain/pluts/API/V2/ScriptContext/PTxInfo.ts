import pstruct from "../../../PTypes/PStruct";
import { list, pair, int, data } from "../../../Term/Type";
import V1PStakingCredential from "../../V1/Address/PStakingCredential";
import V1PDCert from "../../V1/PDCert";
import V1PPubKeyHash from "../../V1/PubKey/PPubKeyHash";
import V1PScriptPurpose from "../../V1/ScriptContext/PScriptPurpose";
import V1PDatumHash from "../../V1/Scripts/PDatumHash";
import V1PPOSIXTimeRange from "../../V1/Time";
import PTxId from "../../V1/Tx/PTxId";
import V1PValue from "../../V1/Value";
import PTxInInfo from "../Tx/PTxInInfo";
import PTxOut from "../Tx/PTxOut";

const PTxInfo = pstruct({
    PTxInfo: {
        inputs: list( PTxInInfo.type ),
        refInputs: list( PTxInInfo.type ),
        outputs: list( PTxOut.type ),
        fee:  V1PValue.type,
        mint: V1PValue.type,
        dCertificates: list( V1PDCert.type ),
        withdrawals: list( pair( V1PStakingCredential.type, int ) ),
        interval: V1PPOSIXTimeRange.type,
        signatories: list( V1PPubKeyHash.type ),
        redeemers: list( pair( V1PScriptPurpose.type, data ) ),
        datums: list( pair( V1PDatumHash.type, data ) ),
        id: PTxId.type
    }
})

export default PTxInfo;