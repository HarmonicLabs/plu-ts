import PMaybe from "../../../Prelude/PMaybe";
import pstruct from "../../../PTypes/PStruct";
import PCredential from "./PCredential";
import PStakingCredential from "./PStakingCredential";

const PAddress = pstruct({
    PAddress: {
        credential: PCredential.type,
        stakingCredential: PMaybe( PStakingCredential.type ).type
    }
})

export default PStakingCredential;