import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { punBData } from "../../../lib/builtins/data";
import { pfn } from "../../../lib/pfn";
import { phoist } from "../../../lib/phoist";
import { bs } from "../../../../type_system/types";
import { PPubKeyHash } from "../PubKey/PPubKeyHash";
import { PValidatorHash } from "../ScriptsHashes/PValidatorHash";

export const PCredential = pstruct({
    PPubKeyCredential: { pkh: PPubKeyHash.type },
    PScriptCredential: { valHash: PValidatorHash.type },
},
( self_t ) => {

    const pcredHash = phoist(
        pfn([ self_t ], bs )
        ( self => punBData.$( self.raw.fields.head ) )
    )

    return {
        hash: pcredHash
    };
});