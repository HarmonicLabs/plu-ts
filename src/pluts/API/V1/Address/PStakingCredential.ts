import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { int } from "../../../../type_system/types";
import { PCredential } from "./PCredential";

export const PStakingCredential = pstruct({
    PStakingHash: { _0: PCredential.type },
    PStakingPtr: {
        _0: int,
        _1: int,
        _2: int
    }
});