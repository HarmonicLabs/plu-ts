import CborPositiveRational from "../../cbor/extra/CborRational";
import ByteString from "../../types/HexString/ByteString";
import Coin from "./Coin";
import PubKeyHash from "../credentials/PubKeyHash";
import Hash32 from "../hashes/Hash32/Hash32";
import PoolKeyHash from "../hashes/Hash28/PoolKeyHash";
import VRFKeyHash from "../hashes/Hash32/VRFKeyHash";
import PoolRelay, { isPoolRelay, poolRelayToCborObj } from "./PoolRelay";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import { canBeUInteger, forceUInteger } from "../../types/ints/Integer";
import CborObj from "../../cbor/CborObj";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborSimple from "../../cbor/CborObj/CborSimple";
import CborArray from "../../cbor/CborObj/CborArray";
import CborString from "../../cbor/CborString";
import CborText from "../../cbor/CborObj/CborText";

export interface IPoolParams {
    operator: PoolKeyHash,
    vrfKeyHash: VRFKeyHash,
    pledge: Coin,
    cost: Coin,
    margin: CborPositiveRational,
    rewardAccount: ByteString,
    owners: PubKeyHash[],
    relays: PoolRelay[],
    metadata?: [poolMetadataUrl: string, hash: Hash32]
}

export default class PoolParams
    implements IPoolParams
{
    readonly operator!: PoolKeyHash;
    readonly vrfKeyHash!: VRFKeyHash;
    readonly pledge!: bigint;
    readonly cost!: bigint;
    readonly margin!: CborPositiveRational;
    readonly rewardAccount!: ByteString;
    readonly owners!: PubKeyHash[];
    readonly relays!: PoolRelay[];
    readonly metadata?: [poolMetadataUrl: string, hash: Hash32];

    constructor( params: IPoolParams )
    {
        JsRuntime.assert(
            ObjectUtils.isObject( params ) &&
            ObjectUtils.hasOwn( params, "operator" ) &&
            ObjectUtils.hasOwn( params, "vrfKeyHash" ) &&
            ObjectUtils.hasOwn( params, "pledge" ) &&
            ObjectUtils.hasOwn( params, "cost" ) &&
            ObjectUtils.hasOwn( params, "margin" ) &&
            ObjectUtils.hasOwn( params, "rewardAccount" ) &&
            ObjectUtils.hasOwn( params, "owners" ) &&
            ObjectUtils.hasOwn( params, "relays" ),
            "invalid pool parameters passed to construct a 'PoopParams' instance"
        );

        const {
            operator,
            vrfKeyHash,
            pledge,
            cost,
            margin,
            rewardAccount,
            owners,
            relays,
            metadata 
        } = params;

        JsRuntime.assert(
            operator instanceof PoolKeyHash,
            "invalid 'operator' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "operator", operator );

        JsRuntime.assert(
            vrfKeyHash instanceof VRFKeyHash,
            "invalid 'vrfKeyHash' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "vrfKeyHash", vrfKeyHash );

        JsRuntime.assert(
            canBeUInteger( pledge ),
            "invalid 'pledge' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "pledge", forceUInteger( pledge ).asBigInt );
        
        JsRuntime.assert(
            canBeUInteger( cost ),
            "invalid 'cost' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "cost", forceUInteger( cost ).asBigInt );

        JsRuntime.assert(
            margin instanceof CborPositiveRational,
            "invalid 'margin' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "margin", margin );

        JsRuntime.assert(
            rewardAccount instanceof ByteString,
            "invalid 'rewardAccount' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "rewardAccount", rewardAccount );

        JsRuntime.assert(
            Array.isArray( owners ) &&
            owners.every( owner => owner instanceof PubKeyHash ),
            "invalid 'owners' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "owners", Object.freeze( owners ) );

        JsRuntime.assert(
            Array.isArray( relays ) &&
            relays.every( isPoolRelay ),
            "invalid 'relays' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "relays", Object.freeze( relays ) );

        JsRuntime.assert(
            metadata === undefined ||
            (
                Array.isArray( metadata ) && metadata.length >= 2 &&
                typeof metadata[0] === "string" && metadata[1] instanceof Hash32
            ),
            "invalid 'metadata' filed for 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "metadata",
            metadata === undefined ? undefined:
            Object.freeze([
                metadata[0],
                metadata[1]
            ])
        );

    }

    toCborObjArray(): CborObj[]
    {
        return Object.freeze([
            this.operator.toCborObj(),
            this.vrfKeyHash.toCborObj(),
            new CborUInt( this.pledge ),
            new CborUInt( this.cost ),
            this.margin,
            this.rewardAccount.toCborObj(),
            this.owners.map( owner => owner.toCborObj() ),
            this.relays.map( poolRelayToCborObj ),
            this.metadata === undefined || this.metadata === null ?
                new CborSimple( null ) :
                new CborArray([
                    new CborText( this.metadata[0] ),
                    this.metadata[1].toCborObj()
                ])
        ]) as any;
    }
};