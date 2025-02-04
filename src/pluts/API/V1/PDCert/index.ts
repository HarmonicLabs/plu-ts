import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { int } from "../../../../type_system/types";
import { PStakingCredential } from "../Address/PStakingCredential";
import { PPubKeyHash } from "../PubKey/PPubKeyHash";

export const PDCert = pstruct({
    KeyRegistration: { stakeKey: PStakingCredential.type },
    KeyDeRegistration: { stakeKey: PStakingCredential.type },
    KeyDelegation: {
        delegator: PStakingCredential.type,
        poolKeyHash: PPubKeyHash.type
    },
    PoolRegistration: {
        poolId: PPubKeyHash.type,
        poolVRF: PPubKeyHash.type,
    },
    PoolRetire: {
        poolId: PPubKeyHash.type,
        epoch: int,                     // epoch
    },
    Genesis: {},
    MoveInstantRewards: {}
});