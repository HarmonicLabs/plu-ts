import pstruct from "../../../PTypes/PStruct";
import PPubKeyHash from "../PubKey/PPubKeyHash";
import PValidatorHash from "../Scripts/PValidatorHash";

const PCredential = pstruct({
    PPubKeyCredential: { _0: PPubKeyHash },
    PScriptCredential: { _0: PValidatorHash },
})

export default PCredential;