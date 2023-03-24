import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { Cbor } from "../../../cbor/Cbor";
import { CborObj } from "../../../cbor/CborObj";
import { CborArray } from "../../../cbor/CborObj/CborArray";
import { CborUInt } from "../../../cbor/CborObj/CborUInt";
import { CborString, CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { DataConstr } from "../../../types/Data/DataConstr";
import { DataI } from "../../../types/Data/DataI";
import { ToData } from "../../../types/Data/toData/interface";
import { canBeUInteger, forceBigUInt } from "../../../types/ints/Integer";
import { ToJson } from "../../../utils/ts/ToJson";
import { StakeCredentials } from "../../credentials/StakeCredentials";
import { GenesisDelegateHash } from "../../hashes/Hash28/GenesisDelegateHash";
import { GenesisHash } from "../../hashes/Hash28/GenesisHash";
import { Hash28 } from "../../hashes/Hash28/Hash28";
import { PoolKeyHash } from "../../hashes/Hash28/PoolKeyHash";
import { VRFKeyHash } from "../../hashes/Hash32/VRFKeyHash";
import { Epoch } from "../Epoch";
import { PoolParams } from "../PoolParams";
import { MoveInstantRewardsCert } from "./MoveInstantRewardsCert";

// number is important as it is included in serialization
export const enum CertificateType {
    StakeRegistration       = 0,
    StakeDeRegistration     = 1,
    StakeDelegation         = 2,
    PoolRegistration        = 3,
    PoolRetirement          = 4,
    GenesisKeyDelegation    = 5,
    MoveInstantRewards      = 6
};

export type CertTypeToStr<CertT extends CertificateType> =
    CertT extends CertificateType.StakeRegistration     ? "StakeRegistration" :
    CertT extends CertificateType.StakeDeRegistration   ? "StakeDeRegistration" :
    CertT extends CertificateType.StakeDelegation       ? "StakeDelegation" :
    CertT extends CertificateType.PoolRegistration      ? "PoolRegistration" :
    CertT extends CertificateType.PoolRetirement        ? "PoolRetirement" :
    CertT extends CertificateType.GenesisKeyDelegation  ? "GenesisKeyDelegation" :
    CertT extends CertificateType.MoveInstantRewards    ? "MoveInstantRewards" :
    never;

export function certTypeToString<CertT extends CertificateType>( certT: CertT ): CertTypeToStr<CertT>
{
    switch( certT )
    {
        case CertificateType.StakeRegistration      :  return "StakeRegistration"       as any;
        case CertificateType.StakeDeRegistration    :  return "StakeDeRegistration"     as any;
        case CertificateType.StakeDelegation        :  return "StakeDelegation"         as any;
        case CertificateType.PoolRegistration       :  return "PoolRegistration"        as any;
        case CertificateType.PoolRetirement         :  return "PoolRetirement"          as any;
        case CertificateType.GenesisKeyDelegation   :  return "GenesisKeyDelegation"    as any;
        case CertificateType.MoveInstantRewards     :  return "MoveInstantRewards"      as any;
        default:
            throw new BasePlutsError("unknown certificate type")
    }
} 

export type StakeRegistration    = CertificateType.StakeRegistration;
export type StakeDeRegistration  = CertificateType.StakeDeRegistration;
export type StakeDelegation      = CertificateType.StakeDelegation;
export type PoolRegistration     = CertificateType.PoolRegistration;
export type PoolRetirement       = CertificateType.PoolRetirement;
export type GenesisKeyDelegation = CertificateType.GenesisKeyDelegation;
export type MoveInstantRewards   = CertificateType.MoveInstantRewards;

export type ParamsOfCert<CertTy extends CertificateType> =
    CertTy extends CertificateType.StakeRegistration ? [ StakeCredentials ] :
    CertTy extends CertificateType.StakeDeRegistration ? [ StakeCredentials ] :
    CertTy extends CertificateType.StakeDelegation ? [ StakeCredentials, PoolKeyHash ] :
    CertTy extends CertificateType.PoolRegistration ? [ PoolParams ] :
    CertTy extends CertificateType.PoolRetirement ? [ PoolKeyHash, Epoch ] :
    CertTy extends CertificateType.GenesisKeyDelegation ? [ GenesisHash, GenesisDelegateHash, VRFKeyHash ] :
    CertTy extends CertificateType.MoveInstantRewards ? [ MoveInstantRewardsCert ] :
    never

export class Certificate<CertTy extends CertificateType>
    implements ToCbor, ToData, ToJson
{
    readonly certType!: CertTy
    readonly params!: ParamsOfCert<CertTy>

    constructor( certType: CertTy, ...params: ParamsOfCert<CertTy> )
    {
        JsRuntime.assert(
            typeof certType === "number" &&
            certType >= 0 && certType <= 6 &&
            certType === Math.round( certType ),
            "unknown certificate type"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "certType",
            certType
        );

        JsRuntime.assert(
            params.length > 0,
            "no certificate paramters provided"
        );

        if( 
            certType === CertificateType.StakeRegistration ||
            certType === CertificateType.StakeDeRegistration
        ){
            JsRuntime.assert(
                params.length >= 1 &&
                params[0] instanceof StakeCredentials,
                "invalid paramters for stake registration / deregistration"
            );
        }

        if( certType === CertificateType.StakeDelegation )
        {
            JsRuntime.assert(
                params.length >= 2 &&
                params[0] instanceof StakeCredentials &&
                params[1] instanceof PoolKeyHash,
                "invalid paramters for stake delegation"
            );
        }

        if( certType === CertificateType.PoolRegistration )
        {
            JsRuntime.assert(
                params.length >= 1 &&
                params[0] instanceof PoolParams,
                "invalid paramters for stake registration / deregistration"
            );
        }

        if( certType === CertificateType.PoolRetirement )
        {
            JsRuntime.assert(
                params.length >= 2 &&
                params[0] instanceof PoolKeyHash &&
                (
                    typeof params[1] === "bigint" ||
                    typeof params[1] === "number"
                ),
                "invalid paramters for stake delegation"
            );
            
            const epoch = forceBigUInt( params[1] as any );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "params",
                Object.freeze([ params[0], epoch ])
            );
            return;
        }

        if( certType === CertificateType.GenesisKeyDelegation )
        {
            JsRuntime.assert(
                params.length >= 3 &&
                params[0] instanceof GenesisHash &&
                params[1] instanceof GenesisDelegateHash &&
                params[2] instanceof VRFKeyHash,
                "invalid paramters for stake delegation"
            );
        }

        if( certType === CertificateType.MoveInstantRewards )
        {
            JsRuntime.assert(
                params.length >= 1 &&
                params[0] instanceof MoveInstantRewardsCert,
                "invalid paramters for stake registration / deregistration"
            );
        }

        ObjectUtils.defineReadOnlyProperty(
            this,
            "params",
            Object.freeze( params )
        );
    }

    toData(): DataConstr
    {
        // every certificate has at most two parameters
        const [ fst, snd ] = this.params;

        switch( this.certType )
        {
            case CertificateType.StakeRegistration:
            case CertificateType.StakeDeRegistration:

                if(!( fst instanceof StakeCredentials ))
                throw new BasePlutsError(
                    "stake (de)registration parameter was not 'StakeCredentials'"
                );

                return new DataConstr(
                    this.certType === CertificateType.StakeRegistration ? 0 : 1 , // KeyRegistration | KeyDeRegistration
                    [ fst.toData() ]
                )
            break;
            case CertificateType.StakeDelegation:
                
                if(!( fst instanceof StakeCredentials ))
                throw new BasePlutsError(
                    "stake delegation frist parameter was not 'StakeCredentials'"
                );

                if(!( snd instanceof Hash28 ))
                throw new BasePlutsError(
                    "stake delegation second parameter was not 'PoolKeyHash'"
                );

                return new DataConstr(
                    2, // KeyDelegation
                    [ fst.toData(), snd.toData() ]
                )
            break;
            case CertificateType.PoolRegistration:
                
                if(!( fst instanceof PoolParams ))
                throw new BasePlutsError(
                    "PoolRegistration frist parameter was not 'PoolRegistration'"
                );

                const {
                    operator: poolId,
                    vrfKeyHash: poolVRF,
                } = fst;

                if(!( poolId instanceof Hash28 && poolVRF instanceof Hash28 ))
                throw new BasePlutsError(
                    "invalid pool registration parameters"
                );

                return new DataConstr(
                    3, // PoolRegistration
                    [ poolId.toData(), poolVRF.toData() ]
                )
            break;
            case CertificateType.PoolRetirement:

                if(!( fst instanceof Hash28 ))
                throw new BasePlutsError(
                    "invalid poolId for pool retirement certificate"
                );

                if( !canBeUInteger( snd ) )
                throw new BasePlutsError(
                    "invalid epoch as second pool retirement cetificate"
                );

                return new DataConstr(
                    4, // PoolRetire
                    [ fst.toData(), new DataI( snd ) ]
                );
            break;
            case CertificateType.GenesisKeyDelegation:
            case CertificateType.MoveInstantRewards:
                return new DataConstr(
                    this.certType === CertificateType.GenesisKeyDelegation ? 5 : 6,
                    []
                );
            break;
            default:
                throw new BasePlutsError(
                    "unmatched certificate type"
                );
        }
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        if( this.certType === CertificateType.PoolRetirement )
        {
            return new CborArray([
                new CborUInt( this.certType ),
                (this.params[0] as ParamsOfCert<4>[0]).toCborObj(),
                new CborUInt( forceBigUInt( this.params[1] as any ) )
            ]);
        }

        if( this.certType === CertificateType.PoolRegistration )
        {
            return new CborArray([
                new CborUInt( this.certType ),
                ...(this.params as [PoolParams])[0].toCborObjArray()
            ]);
        }

        return new CborArray([
            new CborUInt( this.certType ),
            ...this.params.map( p => (p as any).toCborObj() )
        ])
    }

    static fromCbor( cStr: CanBeCborString ): AnyCertificate
    {
        return Certificate.fromCborObj( Cbor.parse( forceCborString( cStr ) ) )
    }
    static fromCborObj( cObj: CborObj ): AnyCertificate
    {
        if(!( cObj instanceof CborArray ))
        throw new InvalidCborFormatError("Certificate");

        const [
            _type,
            ..._params
        ] = cObj.array;

        if(!( _type instanceof CborUInt ))
        throw new InvalidCborFormatError("Certificate");

        const type = Number( _type.num ) as CertificateType;

        switch( type )
        {
            case CertificateType.StakeRegistration:
            case CertificateType.StakeDeRegistration:
                return new Certificate(
                    type,
                    StakeCredentials.fromCborObj( _params[0] )
                );
            case CertificateType.StakeDelegation:
                return new Certificate(
                    type,
                    StakeCredentials.fromCborObj( _params[0] ),
                    PoolKeyHash.fromCborObj( _params[1] )
                );
            case CertificateType.PoolRegistration:
                return new Certificate(
                    type,
                    PoolParams.fromCborObjArray( _params )
                );
            case CertificateType.PoolRetirement:
                if(!( _params[1] instanceof CborUInt ))
                throw new InvalidCborFormatError("Certificate");

                return new Certificate(
                    type,
                    PoolKeyHash.fromCborObj( _params[0] ),
                    _params[1].num
                );
            case CertificateType.GenesisKeyDelegation:
                return new Certificate(
                    type,
                    GenesisHash.fromCborObj( _params[0] ),
                    GenesisDelegateHash.fromCborObj( _params[1] ),
                    VRFKeyHash.fromCborObj( _params[2] ),
                );
            case CertificateType.MoveInstantRewards:
                return new Certificate(
                    type,
                    MoveInstantRewardsCert.fromCborObj( _params[0] )
                );
            default:
                throw new InvalidCborFormatError("Certificate");
        }
    }

    toJson()
    {
        const certTypeStr = certTypeToString( this.certType );

        switch( this.certType )
        {
            case CertificateType.StakeRegistration:                
            case CertificateType.StakeDeRegistration:
                return {
                    certType: certTypeStr,
                    stakeCredentials: ( this.params[0] as StakeCredentials ).toJson()
                }
            break;
            case CertificateType.StakeDelegation:
                return {
                    certType: certTypeStr,
                    stakeCredentials: ( this.params[0] as StakeCredentials ).toJson(),
                    poolKeyHash: ( this.params[1] as PoolKeyHash ).asString
                }
            break;
            case CertificateType.PoolRegistration:
                return {
                    certType: certTypeStr,
                    poolParams: ( this.params[0] as PoolParams ).toJson(),
                }                
            break;
            case CertificateType.PoolRetirement:
                return {
                    certType: certTypeStr,
                    poolKeyHash: ( this.params[0] as PoolKeyHash ).asString,
                    epoch: Number( forceBigUInt( this.params[1] as Epoch ) ),
                }  
            break;
            case CertificateType.GenesisKeyDelegation:
                return {
                    certType: certTypeStr,
                    genesisHash: (this.params[0] as GenesisHash).asString,
                    genesisDelegateHash: (this.params[1] as GenesisDelegateHash).asString,
                    vrfKeyHash: (this.params[2] as VRFKeyHash).asString  
                }
            break;
            case CertificateType.MoveInstantRewards:
                return {
                    certType: certTypeStr,
                    mirCert: (this.params[0] as MoveInstantRewardsCert).toJson()
                }
            break;
            default:
                throw new BasePlutsError("unknown certificate type")
        }
    }
}

export type AnyCertificate = Certificate<CertificateType>;

const ada = BigInt( 1_000_000 );

export function certToDepositLovelaces( cert: AnyCertificate ): bigint
{
    const t = cert.certType;

    if( t === CertificateType.StakeRegistration )       return BigInt(  2 ) * ada;
    if( t === CertificateType.StakeDeRegistration )     return BigInt( -2 ) * ada;

    if( t === CertificateType.PoolRegistration )        return BigInt(  500 ) * ada;
    if( t === CertificateType.PoolRetirement   )        return BigInt( -500 ) * ada;

    return BigInt(0);
}

export function certificatesToDepositLovelaces( certs: AnyCertificate[] ): bigint
{
    return certs.reduce( (a,b) => a + certToDepositLovelaces( b ), BigInt(0) );
}