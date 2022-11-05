import pstruct from "../../../PTypes/PStruct/pstruct";
import { int } from "../../../Term/Type/base";
import PStakingCredential from "../Address/PStakingCredential";
import PPubKeyHash from "../PubKey/PPubKeyHash";

const PDCert = pstruct({
    KeyRegistration: { _0: PStakingCredential.type },
    KeyDeRegistration: { _0: PStakingCredential.type },
    KeyDelegation: {
        _0: PStakingCredential.type, // delegator
        _1: PPubKeyHash.type              // delegatee
    },
    PoolRegistration: {
        _0: PPubKeyHash.type,             // poolId
        _1: PPubKeyHash.type,             // pool VFR
    },
    PoolRetire: {
        _0: PPubKeyHash.type,
        _1: int,                     // epoch
    },
    Genesis: {},
    Mir: {}
})

export default PDCert;