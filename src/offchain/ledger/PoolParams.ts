import CborPositiveRational from "../../cbor/extra/CborRational";
import ByteString from "../../types/HexString/ByteString";
import Coin from "./Coin";
import PubKeyHash from "../credentials/PubKeyHash";
import Hash32 from "../hashes/Hash32/Hash32";
import PoolKeyHash from "../hashes/Hash28/PoolKeyHash";
import VRFKeyHash from "../hashes/Hash32/VRFKeyHash";
import PoolRelay from "./PoolRelay";

export interface IPoolParams {
    operator: PoolKeyHash,
    vrfKeyHash: VRFKeyHash,
    pledge: Coin,
    cost: Coin,
    margin: CborPositiveRational,
    rewardAccount: ByteString,
    owners: PubKeyHash[],
    relays: PoolRelay[],
    metadata?: [poolMetadataUrl: string, hash: Hash32] | null
}

export default class PoolParams
    implements IPoolParams
{
    readonly operator: PoolKeyHash;
    readonly vrfKeyHash: VRFKeyHash;
    readonly pledge: bigint;
    readonly cost: bigint;
    readonly margin: CborPositiveRational;
    readonly rewardAccount: ByteString;
    readonly owners: PubKeyHash[];
    readonly relays: PoolRelay[];
    readonly metadata: [poolMetadataUrl: string, hash: Hash32] | null;
};