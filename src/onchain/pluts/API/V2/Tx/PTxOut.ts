import pstruct from "../../../PTypes/PStruct";
import PMaybe from "../../../stdlib/PMaybe";
import V1PAddress from "../../V1/Address";
import V1PScriptHash from "../../V1/Scripts/PScriptHash";
import V1PValue from "../../V1/Value";
import POutputDatum from "./POutputDatum";

const PTxOut = pstruct({
    PTxOut: {
        address: V1PAddress.type,
        value: V1PValue.type,
        datum: POutputDatum.type,
        refScrpt: PMaybe( V1PScriptHash.type ).type
    }
});

export default PTxOut;