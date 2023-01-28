import { byte, decodeBech32, encodeBech32 } from "../../crypto";
import BasePlutsError from "../../errors/BasePlutsError";
import { NetworkT } from "../Network";
import PaymentCredentials, { PaymentCredentialsType } from "../credentials/PaymentCredentials";
import StakeCredentials, { StakeCredentialsType } from "../credentials/StakeCredentials";
import Hash28 from "../hashes/Hash28/Hash28";
import type { ToData } from "../../types/Data/toData/interface"
import Data from "../../types/Data";
import PAddress from "../../onchain/pluts/API/V1/Address/PAddress";
import DataConstr from "../../types/Data/DataConstr";
import BigIntUtils from "../../utils/BigIntUtils";
import UPLCFlatUtils from "../../utils/UPLCFlatUtils";
import { forceBigUInt } from "../../types/ints/Integer";
import Cloneable from "../../types/interfaces/Cloneable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import CborObj from "../../cbor/CborObj";
import CborBytes from "../../cbor/CborObj/CborBytes";
import CborString from "../../cbor/CborString";
import Cbor from "../../cbor/Cbor";
import { nothingData, justData } from "../../types/Data/toData/maybeData";
import ToJson from "../../utils/ts/ToJson";

export type AddressType
    = "base"
    | "pointer"
    | "enterprise"
    | "bootstrap"
    | "unknown"

/**
 * shelley specification in cardano-ledger; page 113
 */
export default class Address
    implements ToData, Cloneable<Address>, ToCbor, ToJson
{
    readonly network: NetworkT
    readonly paymentCreds: PaymentCredentials
    readonly stakeCreds?: StakeCredentials
    readonly type: AddressType;

    constructor(
        network: NetworkT,
        paymentCreds: PaymentCredentials,
        stakeCreds?: StakeCredentials,
        type?: AddressType
    )
    {
        type = type === undefined ? 
            (stakeCreds === undefined ? "enterprise" : "base")
            : type;
        JsRuntime.assert(
            type === "base"         ||
            type === "enterprise"   ||
            type === "bootstrap"    ||
            type === "pointer",
            "invalid address type"
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "type", type
        );

        JsRuntime.assert(
            network === "mainnet" || network === "testnet",
            "invalid network"
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "network", network
        );

        JsRuntime.assert(
            paymentCreds instanceof PaymentCredentials,
            "invalid payment credentials"
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "paymentCreds", paymentCreds.clone()
        );

        JsRuntime.assert(
            stakeCreds === undefined || stakeCreds instanceof StakeCredentials,
            "invalid stake credentials"
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "stakeCreds", stakeCreds?.clone()
        );


    }

    clone(): Address
    {
        return new Address(
            this.network,
            this.paymentCreds, // cloned in constructor
            this.stakeCreds,   // cloned in constructor
            this.type
        );
    }

    toData(): Data
    {
        PAddress
        return new DataConstr(
            0, // PAddress has only 1 constructor,
            [
                this.paymentCreds.toData(),
                this.stakeCreds === undefined ?
                    nothingData() :
                    justData( this.stakeCreds.toData() )
            ]
        )
    }

    toBytes(): byte[]
    {
        return [(
            // header byte
            ( this.network === "mainnet" ? 0b0001_0000 : 0b0000_0000 ) |  
            (
                this.type === "base" ?       0b0000 :
                this.type === "pointer" ?    0b0100 :
                this.type === "enterprise" ? 0b0110 :
                0b1000 // bootstrap
            ) |
            ( this.stakeCreds?.type === "script" ? 0b10 : 0b00 ) |
            ( this.paymentCreds.type === "script" ? 0b1 : 0b0 )
        ) as byte]
        .concat(
            Array.from( this.paymentCreds.hash.asBytes ) as byte[]
        )
        .concat(
            this.stakeCreds === (void 0) ? [] : // add nothing

            Array.isArray( this.stakeCreds.hash ) ? // pointer 
                this.stakeCreds.hash
                .reduce( ( acc, n ) =>
                    acc.concat(
                        Array.from(
                            UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream(
                                forceBigUInt( n )
                            ).toBuffer().buffer
                        ) as byte[]
                    ),
                    [] as byte[]
                ) :
            // hash (script or key)
            Array.from( this.stakeCreds?.hash.asBytes ?? [] ) as byte[]
        );
    }

    toBuffer(): Buffer
    {
        return Buffer.from( this.toBytes() )
    }

    toCborObj(): CborObj
    {
        return new CborBytes( this.toBuffer() );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toString(): string
    {
        return encodeBech32(
            this.network === "mainnet" ? "addr" : "addr_test",
            this.toBytes()
        )
    }

    toJson()
    {
        return this.toString();
    }

    static fromString( addr: string ): Address
    {
        const [ hrp, [ header, ...payload ] ] = decodeBech32( addr );

        let network: NetworkT;
        switch( hrp )
        {
            case "addr_test": 
                network = "testnet";
            break;
            case "addr":
                network = "mainnet";
            break;
            default:
                throw new BasePlutsError(
                    "string passed is not a Cardano address"
                );
        }

        const addrType = (header & 0b1111_0000) >> 4;
        const headerNetwork: NetworkT = ((header & 0b0000_1111) >> 4) === 0 ? "testnet" : "mainnet" ;

        if( headerNetwork !== network )
        throw new BasePlutsError(
            "ill formed address; human readable part netwok missmatches header byte network"
        );

        const type: AddressType =
            addrType <= 0b0011  ? "base" :
            addrType <= 0b0101  ? "pointer" :
            addrType <= 0b0111  ? "enterprise" :
            addrType === 0b1000 ? "bootstrap" :
            // addrType === 0b1110 || addrType === 0b1111 ? "stake" :
            "unknown";

        let payment: byte[];
        let stake: byte[];

        const paymentType: PaymentCredentialsType = (addrType & 0b0001) === 1 ? "script": "pubKey"; 
        const   stakeType: StakeCredentialsType   = (addrType & 0b0010) === 1 ? "script": "stakeKey";

        switch( type )
        {
            case "base":
                console.log( payload.length );
                if( payload.length !== (28 * 2) )
                throw new BasePlutsError(
                    "address' header specifies a base adress but the payload is incorrect"
                );

                payment = payload.slice( 0, 28 ),
                stake = payload.slice( 28 );
            break;
            case "bootstrap":
            case "enterprise":
            case "pointer":
                if( payload.length !== 28 )
                throw new BasePlutsError(
                    "address' payload is incorrect"
                );

                payment = payload.slice(),
                stake = []; // ignore pointer; might change in future version
            
            break;
            default:
                throw new BasePlutsError("unknown addres type; can't extract payload") 
        }

        if( payment.length !== 28 )
        {
            throw new BasePlutsError(
                "missing payment credentials"
            )
        }
        
        return new Address(
            network,
            new PaymentCredentials(
                paymentType,
                new Hash28( Buffer.from( payment ) )
            ),
            stake.length === 28 ?
                new StakeCredentials(
                    stakeType,
                    new Hash28( Buffer.from( stake ) )
                ):
                undefined,
            type
        );
    }
}