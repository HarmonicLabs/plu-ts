import pstruct from "../../../PTypes/PStruct";
import { data } from "../../../Term/Type";
import PDatumHash from "../../V1/Scripts/PDatumHash";

const POutputDatum = pstruct({
    NoDatum: {},
    DatumHash: { datumHash: PDatumHash.type },
    InlineDatum: { datum: data }
});

export default POutputDatum;