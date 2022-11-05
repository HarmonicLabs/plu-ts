import pstruct from "../../../PTypes/PStruct/pstruct";
import PPubKeyHash from "../PubKey/PPubKeyHash";
import PValidatorHash from "../ScriptsHashes/PValidatorHash";

const PCredential = pstruct({
    PPubKeyCredential: { pkh: PPubKeyHash.type },
    PScriptCredential: { valHash: PValidatorHash.type },
})

export default PCredential;