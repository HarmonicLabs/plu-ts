import { forceUInteger, UInteger } from "../../../types/ints/Integer";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import StakeCredentials from "../../credentials/StakeCredentials";
import GenesisDelegateHash from "../../hashes/Hash28/GenesisDelegateHash";
import GenesisHash from "../../hashes/Hash28/GenesisHash";
import PoolKeyHash from "../../hashes/Hash28/PoolKeyHash";
import VRFKeyHash from "../../hashes/Hash32/VRFKeyHash";
import Epoch from "../Epoch";
import PoolParams from "../PoolParams";
import MoveInstantRewardsCert from "./MoveInstantRewardsCert";

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

export default class Certificate<CertTy extends CertificateType>
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
                    typeof params[1] === "number" ||
                    params[1] instanceof UInteger
                ),
                "invalid paramters for stake delegation"
            );
            
            const epoch = forceUInteger( params[1] as any ).asBigInt;

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
}

export type AnyCertificate = Certificate<CertificateType>;