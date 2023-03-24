import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";

import { canBeUInteger, forceBigUInt } from "../../types/ints/Integer";
import { PoolRelay, isPoolRelay, poolRelayFromCborObj, poolRelayToCborObj, poolRelayToJson } from "./PoolRelay";
import { CborPositiveRational } from "../../cbor/extra/CborRational";
import { ByteString } from "../../types/HexString/ByteString";
import { Coin } from "./Coin";
import { PubKeyHash } from "../credentials/PubKeyHash";
import { Hash32 } from "../hashes/Hash32/Hash32";
import { PoolKeyHash } from "../hashes/Hash28/PoolKeyHash";
import { VRFKeyHash } from "../hashes/Hash32/VRFKeyHash";
import { CborObj } from "../../cbor/CborObj";
import { CborUInt } from "../../cbor/CborObj/CborUInt";
import { CborSimple } from "../../cbor/CborObj/CborSimple";
import { CborArray } from "../../cbor/CborObj/CborArray";
import { CborText } from "../../cbor/CborObj/CborText";
import { ToJson } from "../../utils/ts/ToJson";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { InvalidCborFormatError } from "../../errors/InvalidCborFormatError";
import { CborTag } from "../../cbor/CborObj/CborTag";
import { CborBytes } from "../../cbor/CborObj/CborBytes";

export interface IPoolParams {
    operator: PoolKeyHash,
    vrfKeyHash: VRFKeyHash,
    pledge: Coin,
    cost: Coin,
    margin: CborPositiveRational,
    rewardAccount: Hash28,
    owners: PubKeyHash[],
    relays: PoolRelay[],
    metadata?: [poolMetadataUrl: string, hash: Hash32]
}

export class PoolParams
    implements IPoolParams, ToJson
{
    readonly operator!: PoolKeyHash;
    readonly vrfKeyHash!: VRFKeyHash;
    readonly pledge!: bigint;
    readonly cost!: bigint;
    readonly margin!: CborPositiveRational;
    readonly rewardAccount!: Hash28;
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
        ObjectUtils.defineReadOnlyProperty( this, "pledge", forceBigUInt( pledge ) );
        
        JsRuntime.assert(
            canBeUInteger( cost ),
            "invalid 'cost' constructing 'PoolParams'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "cost", forceBigUInt( cost ) );

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
            new CborArray( this.owners.map( owner => owner.toCborObj() ) ),
            new CborArray( this.relays.map( poolRelayToCborObj ) ),
            this.metadata === undefined || this.metadata === null ?
                new CborSimple( null ) :
                new CborArray([
                    new CborText( this.metadata[0] ),
                    this.metadata[1].toCborObj()
                ])
        ]) as any;
    }

    static fromCborObjArray([
        _operator,
        _vrfKeyHash,
        _pledge,
        _cost,
        _margin,
        _rewAccount,
        _owners,
        _relays,
        _metadata
    ]: CborObj[]): PoolParams
    {
        if(!(
            _pledge instanceof CborUInt &&
            _cost instanceof CborUInt &&
            _owners instanceof CborArray &&
            _relays instanceof CborArray &&
            _margin instanceof CborTag && _margin.data instanceof CborArray &&
            _margin.data.array.every( n => n instanceof CborUInt ) && _margin.data.array.length >= 2
        ))
        throw new InvalidCborFormatError("PoolParams");

        const [ margin_num, margin_den ] = _margin.data.array.map( n => (n as CborUInt).num )

        return new PoolParams({
            operator: PoolKeyHash.fromCborObj( _operator ),
            vrfKeyHash: VRFKeyHash.fromCborObj( _vrfKeyHash ),
            pledge: _pledge.num,
            cost: _cost.num,
            margin: new CborPositiveRational( margin_num, margin_den ),
            rewardAccount: Hash28.fromCborObj( _rewAccount ),
            owners: _owners.array.map( PubKeyHash.fromCborObj ),
            relays: _relays.array.map( poolRelayFromCborObj ),
            metadata: (
                _metadata instanceof CborArray &&
                _metadata.array[0] instanceof CborText &&
                _metadata.array[1] instanceof CborBytes
            ) ? 
            [ _metadata.array[0].text, Hash32.fromCborObj( _metadata.array[1] ) ]
            : undefined
        })
    }

    toJson()
    {
        return {
            operator: this.operator.asString,
            vrfKeyHash: this.vrfKeyHash.asString,
            pledge: this.pledge.toString(),
            cost: this.cost.toString(),
            margin: Number( this.margin.num ) / Number( this.margin.den ),
            rewardAccount: this.rewardAccount.asString,
            owners: this.owners.map( owner => owner.asString ),
            relays: this.relays.map( poolRelayToJson ),
            metadata: this.metadata === undefined ? undefined : {
                poolMetadataUrl: this.metadata[0],
                hash: this.metadata[1].asString
            }
        }
    }
};