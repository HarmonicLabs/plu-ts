import { data } from "../../../Term/Type/base";
import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PDatumHash } from "../../V1/ScriptsHashes/PDatumHash";

export const POutputDatum = pstruct({
    NoDatum: {},
    DatumHash: { datumHash: PDatumHash.type },
    InlineDatum: { datum: data }
});