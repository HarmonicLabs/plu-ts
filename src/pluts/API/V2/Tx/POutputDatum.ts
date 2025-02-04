import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { data } from "../../../../type_system/types";
import { PDatumHash } from "../../V1/ScriptsHashes/PDatumHash";

export const POutputDatum = pstruct({
    NoDatum: {},
    DatumHash: { datumHash: PDatumHash.type },
    InlineDatum: { datum: data }
});