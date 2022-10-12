import pstruct from "../../../PTypes/PStruct";
import { data } from "../../../Term/Type";
import PDatumHash from "../Scripts/PDatumHash";

const POutputDatum = pstruct({
    None: {},
    DatumHash: { datumHash: PDatumHash.type },   // V1
    Datum: { datum: data }                  // inline datum
});

export default POutputDatum;