import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PPubKeyHash } from "../PubKey/PPubKeyHash";
import { PValidatorHash } from "../ScriptsHashes/PValidatorHash";

export const PCredential = pstruct({
    PPubKeyCredential: { pkh: PPubKeyHash.type },
    PScriptCredential: { valHash: PValidatorHash.type },
});