import pstruct from "../../../PTypes/PStruct";
import { int } from "../../../Term/Type";
import PCredential from "./PCredential";

const PStakingCredential = pstruct({
    PStakingHash: { _0: PCredential.type },
    PStakingPtr: {
        _0: int,
        _1: int,
        _2: int
    }
});

export default PStakingCredential;