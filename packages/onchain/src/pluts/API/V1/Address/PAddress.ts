import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PMaybe } from "../../../lib/std/PMaybe/PMaybe";
import { PCredential } from "./PCredential";
import { PStakingCredential } from "./PStakingCredential";

export const PAddress = pstruct({
    PAddress: {
        credential: PCredential.type,
        stakingCredential: PMaybe( PStakingCredential.type ).type
    }
})