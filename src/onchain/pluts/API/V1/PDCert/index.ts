import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { int } from "../../../type_system/types";
import { PStakingCredential } from "../Address/PStakingCredential";
import { PPubKeyHash } from "../PubKey/PPubKeyHash";

export const PDCert = pstruct({
    KeyRegistration: { _0: PStakingCredential.type },
    KeyDeRegistration: { _0: PStakingCredential.type },
    KeyDelegation: {
        delegator: PStakingCredential.type,
        poolKeyHash: PPubKeyHash.type
    },
    PoolRegistration: {
        poolId: PPubKeyHash.type,
        poolVFR: PPubKeyHash.type,
    },
    PoolRetire: {
        poolId: PPubKeyHash.type,
        epoch: int,                     // epoch
    },
    Genesis: {},
    MoveInstantRewards: {}
})