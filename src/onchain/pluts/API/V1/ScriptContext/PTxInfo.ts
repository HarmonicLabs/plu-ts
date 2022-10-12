import pstruct from "../../../PTypes/PStruct";
import { data, int, list, pair, unit } from "../../../Term/Type";
import PStakingCredential from "../Address/PStakingCredential";
import PDCert from "../PDCert";
import PPubKeyHash from "../PubKey/PPubKeyHash";
import PDatumHash from "../Scripts/PDatumHash";
import PPOSIXTimeRange from "../Time";
import PTxId from "../Tx/PTxId";
import PTxInInfo from "../Tx/PTxInInfo";
import PTxOut from "../Tx/PTxOut";
import PValue from "../Value/PValue";

const PTxInfo = pstruct({
    PTxInfo: {
        inputs: list( PTxInInfo.type ),
        outputs: list( PTxOut.type ),
        fee:  PValue.type,
        mint: PValue.type,
        dCertificates: list( PDCert.type ),
        withdrawals: list( pair( PStakingCredential.type, int ) ),
        interval: PPOSIXTimeRange.type,
        signatories: list( PPubKeyHash.type ),
        datums: list( pair( PDatumHash.type, data ) ),
        id: PTxId.type
    }
})

export default PTxInfo;