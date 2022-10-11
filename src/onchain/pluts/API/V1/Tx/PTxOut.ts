import PMaybe from "../../../Prelude/PMaybe";
import pstruct from "../../../PTypes/PStruct";
import PAddress from "../Address/PAddress";
import PScriptHash from "../Scripts/PScriptHash";
import PValue from "../Value/PValue";
import POutputDatum from "./POutputDatum";

const PTxOut = pstruct({
    PTxOut: {
        address: PAddress.type,
        value: PValue,
        datum: POutputDatum.type,
        refScript: PMaybe( PScriptHash ).type
    }
})

export default PTxOut;