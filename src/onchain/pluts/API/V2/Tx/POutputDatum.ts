import pstruct from "../../../PTypes/PStruct/pstruct";
import { data } from "../../../Term/Type/base";
import PDatumHash from "../../V1/ScriptsHashes/PDatumHash";

const POutputDatum = pstruct({
    NoDatum: {},
    DatumHash: { datumHash: PDatumHash.type },
    InlineDatum: { datum: data }
});

export default POutputDatum;