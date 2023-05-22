import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { int } from "../../../type_system";

export const PExtended = pstruct({
    PNegInf: {},
    PFinite: { _0: int },
    PPosInf: {}
});
