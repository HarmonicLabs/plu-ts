import pstruct from "../../../PTypes/PStruct";
import PStakingCredential from "../Address/PStakingCredential";
import PDelegationCert from "../PDelegationCert";
import PTxOutRef from "../Tx/PTxOutRef";
import PCurrencySymbol from "../Value/PCurrencySymbol";

const PScriptPurpose = pstruct({
    Minting: { _0: PCurrencySymbol },
    Spending: { _0: PTxOutRef.type },
    Rewarding: { _0: PStakingCredential.type },
    Certifying: { _0: PDelegationCert.type }
})

export default PScriptPurpose;