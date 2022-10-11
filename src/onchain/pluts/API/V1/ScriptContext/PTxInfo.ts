import pstruct from "../../../PTypes/PStruct";
import { data, int, list, pair, unit } from "../../../Term/Type";
import PStakingCredential from "../Address/PStakingCredential";
import PDelegationCert from "../PDelegationCert";
import PPubKeyHash from "../PubKey/PPubKeyHash";
import PDatumHash from "../Scripts/PDatumHash";
import PTxId from "../Tx/PTxId";
import PTxInInfo from "../Tx/PTxInInfo";
import PTxOut from "../Tx/PTxOut";
import PValue from "../Value/PValue";

const PTxInfo = pstruct({
    PTxInfo: {
        inputs: list( PTxInInfo.type ),
        outputs: list( PTxOut.type ),
        fee: PValue,
        mint: PValue,
        dCertificates: list( PDelegationCert.type ),
        withdrawals: list( pair( PStakingCredential.type, int ) ),
        interval: unit,
        signatories: list( PPubKeyHash ),
        datums: list( pair( PDatumHash, data ) ),
        id: PTxId.type
    }
})

export default PTxInfo;