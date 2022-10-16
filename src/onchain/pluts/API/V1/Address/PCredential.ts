import pstruct from "../../../PTypes/PStruct";
import PPubKeyHash from "../PubKey/PPubKeyHash";
import PValidatorHash from "../Scripts/PValidatorHash";

const PCredential = pstruct({
    PPubKeyCredential: { pkh: PPubKeyHash.type },
    PScriptCredential: { valHash: PValidatorHash.type },
})

export default PCredential;