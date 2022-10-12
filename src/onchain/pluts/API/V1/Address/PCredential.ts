import pstruct from "../../../PTypes/PStruct";
import PPubKeyHash from "../PubKey/PPubKeyHash";
import PValidatorHash from "../Scripts/PValidatorHash";

const PCredential = pstruct({
    PPubKeyCredential: { _0: PPubKeyHash.type },
    PScriptCredential: { _0: PValidatorHash.type },
})

export default PCredential;