import PMaybe from "../../../stdlib/PMaybe/PMaybe";
import pstruct from "../../../PTypes/PStruct/pstruct";
import PDatumHash from "../ScriptsHashes/PDatumHash";
import PValue from "../Value/PValue";
import PAddress from "../Address/PAddress";

const PTxOut = pstruct({
    PTxOut: {
        address: PAddress.type,
        value: PValue.type,
        datumHash: PMaybe( PDatumHash.type ).type
    }
})

export default PTxOut;