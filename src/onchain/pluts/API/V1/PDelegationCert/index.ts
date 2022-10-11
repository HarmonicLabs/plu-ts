import pstruct from "../../../PTypes/PStruct";
import { int } from "../../../Term/Type";
import PStakingCredential from "../Address/PStakingCredential";
import PPubKeyHash from "../PubKey/PPubKeyHash";

const PDelegationCert = pstruct({
    KeyRegistration: { _0: PStakingCredential.type },
    KeyDeRegistration: { _0: PStakingCredential.type },
    KeyDelegation: {
        _0: PStakingCredential.type, // delegator
        _1: PPubKeyHash              // delegatee
    },
    PoolRegistration: {
        _0: PPubKeyHash,             // poolId
        _1: PPubKeyHash,             // pool VFR
    },
    PoolRetire: {
        _0: PPubKeyHash,
        _1: int,                    // epoch
    },
    Genesis: {},
    Mir: {}
})

export default PDelegationCert;