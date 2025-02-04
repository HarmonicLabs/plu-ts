import { pstruct } from "../../../../PTypes/PStruct/pstruct";
import { data, int, list, pair } from "../../../../../type_system/types";
import { PStakingCredential } from "../../Address/PStakingCredential";
import { PDCert } from "../../PDCert";
import { PPubKeyHash } from "../../PubKey/PPubKeyHash";
import { PDatumHash } from "../../ScriptsHashes/PDatumHash";
import { PPOSIXTimeRange } from "../../Time";
import { PTxId } from "../../Tx/PTxId";
import { PTxInInfo } from "../../Tx/PTxInInfo";
import { PTxOut } from "../../Tx/PTxOut";
import { PValue } from "../../Value/PValue";

export const PTxInfo = pstruct({
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