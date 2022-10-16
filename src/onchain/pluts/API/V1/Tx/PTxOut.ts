import PMaybe from "../../../Prelude/PMaybe";
import pstruct from "../../../PTypes/PStruct";
import PAddress from "../Address";
import PDatumHash from "../Scripts/PDatumHash";
import PValue from "../Value/PValue";

const PTxOut = pstruct({
    PTxOut: {
        address: PAddress.type,
        value: PValue.type,
        datumHash: PMaybe( PDatumHash.type ).type
    }
})

export default PTxOut;