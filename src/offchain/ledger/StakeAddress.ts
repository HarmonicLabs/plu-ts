import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";

import { NetworkT } from "../ledger/Network";
import { StakeCredentials, StakeValidatorHash } from "../credentials/StakeCredentials";
import { byte, decodeBech32, encodeBech32 } from "../../crypto";
import { Cloneable } from "../../types/interfaces/Cloneable";
import { StakeKeyHash } from "../credentials/StakeKeyHash";
import { Hash28 } from "../hashes/Hash28/Hash28";
import { BasePlutsError } from "../../errors/BasePlutsError";
import { hexToBytes } from "../../crypto/utils/hexToBytes";
import { PubKeyHash, PublicKey } from "../credentials";


export type StakeAddressBech32 = `stake1${string}` | `stake_test1${string}`;

export type StakeAddressType = "stakeKey" | "script";

export type StakeAddressCredentials<T extends StakeAddressType> = T extends "stakeKey" ? StakeKeyHash : StakeValidatorHash;

export class StakeAddress<T extends StakeAddressType = StakeAddressType>
    implements Cloneable<StakeAddress>
{
    readonly network!: NetworkT
    readonly type!: T;
    readonly credentials!: StakeAddressCredentials<T>

    constructor(
        network: NetworkT,
        credentials: Hash28,
        type?: T
    )
    {
        const t = type === undefined ? 
            (credentials instanceof StakeValidatorHash ? "script" : "stakeKey")
            : type;

        JsRuntime.assert(
            t === "script" || t === "stakeKey",
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
            credentials instanceof Hash28 &&
            (
                ( t === "stakeKey" && !(credentials instanceof StakeValidatorHash) ) ||
                ( t === "script" && !(credentials instanceof StakeKeyHash) )
            ),
            "invalid stake credentials"
        );
        ObjectUtils.defineReadOnlyProperty(
            this, "credentials",
            t === "stakeKey" ? new StakeKeyHash( credentials ) : new StakeValidatorHash( credentials )
        );
    }

    clone(): StakeAddress<T>
    {
        return new StakeAddress(
            this.network,
            this.credentials,
            this.type
        );
    }

    toString(): StakeAddressBech32
    {
        return encodeBech32(
            this.network === "mainnet" ? "stake" : "stake_test",
            this.credentials.asBytes
        ) as any;
    }

    static fromString( str: string ): StakeAddress
    static fromString<T extends StakeAddressType = StakeAddressType>( str: string, type: T ): StakeAddress<T>
    static fromString( str: string, type: StakeAddressType = "stakeKey" )
    {
        const [ hrp, creds ] = decodeBech32( str );

        if( hrp !== "stake" && hrp !== "stake_test" )
        throw new BasePlutsError(
            "invalid stake address string"
        );

        return StakeAddress.fromBytes(
            creds,
            hrp === "stake" ? "mainnet" : "testnet",
            type
        )
    }

    toBytes(): byte[]
    {
        return Array.from( this.credentials.asBytes ) as any;
    }

    static fromBytes(
        bs: byte[] | string | Buffer,
        netwok: NetworkT = "mainnet",
        type: StakeAddressType = "stakeKey"
    ): StakeAddress
    {
        bs = Buffer.from( typeof bs === "string" ? hexToBytes( bs ) : bs );

        if( bs.length === 29 )
        {
            const header = bs[0];
            bs = bs.slice(1);
            type = Boolean(header && 0b0001_0000) ? "script" : "stakeKey";
            netwok = Boolean(header & 0b1111) ? "mainnet" : "testnet";
        }

        return new StakeAddress(
            netwok,
            bs.length === 28 ? new Hash28( bs ) : new PublicKey( bs ).hash,
            type
        )
    }

    toStakeCredentials(): StakeCredentials<T>
    {
        return new StakeCredentials(
            this.type,
            new Hash28( this.credentials ) as any
        );
    }
}