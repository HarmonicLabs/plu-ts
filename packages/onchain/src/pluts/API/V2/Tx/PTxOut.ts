import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { V1 } from "../../V1";
import { POutputDatum } from "./POutputDatum";

export const PTxOut = pstruct({
    PTxOut: {
        address: V1.PAddress.type,
        value: V1.PValue.type,
        datum: POutputDatum.type,
        refScrpt: PMaybe( V1.PScriptHash.type ).type
    }
});