import pstruct from "../../../../PTypes/PStruct/pstruct";
import PStakingCredential from "../../Address/PStakingCredential";
import PDCert from "../../PDCert";
import PTxOutRef from "../../Tx/PTxOutRef";
import PCurrencySymbol from "../../Value/PCurrencySymbol";

const PScriptPurpose = pstruct({
    Minting: { currencySym: PCurrencySymbol.type },
    Spending: { utxoRef: PTxOutRef.type },
    Rewarding: { stakeCredential: PStakingCredential.type },
    Certifying: { dCert: PDCert.type }
})

export default PScriptPurpose;