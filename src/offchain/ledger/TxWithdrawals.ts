import { canBeUInteger, forceBigUInt, forceUInteger, UInteger } from "../../types/ints/Integer";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import Coin from "./Coin";
import Hash28 from "../hashes/Hash28/Hash28";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import CborObj from "../../cbor/CborObj";
import CborString from "../../cbor/CborString";
import Cbor from "../../cbor/Cbor";
import CborMap from "../../cbor/CborObj/CborMap";
import CborUInt from "../../cbor/CborObj/CborUInt";
import Value from "./Value/Value";
import { isHex } from "../../types/HexString";
import ToData from "../../types/Data/toData/interface";
import Data from "../../types/Data";
import DataMap from "../../types/Data/DataMap";
import DataPair from "../../types/Data/DataPair";
import StakeCredentials, { StakeKeyHash } from "../credentials/StakeCredentials";
import DataI from "../../types/Data/DataI";
import DataConstr from "../../types/Data/DataConstr";
import ToJson from "../../utils/ts/ToJson";

export type TxWithdrawalsEntryBigInt = {
    rewardAccount: Hash28,
    amount: bigint
}

export type TxWithdrawalsMapBigInt = TxWithdrawalsEntryBigInt[];

export type TxWithdrawalsEntry = {
    rewardAccount: Hash28,
    amount: Coin
}

export type TxWithdrawalsMap = TxWithdrawalsEntry[];

export type ITxWithdrawals
    = { [rewardAccount: string]: Coin }
    | TxWithdrawalsMap;

export function isTxWithdrawalsMap( stuff: any ): stuff is TxWithdrawalsMap
{
    if( !Array.isArray( stuff ) ) return false;

    return stuff.every( ({ rewardAccount, amount }) => rewardAccount instanceof Hash28 && canBeUInteger( amount ) );
}

export function isITxWithdrawals( stuff: any ): stuff is ITxWithdrawals
{
    if( !(typeof stuff === "object") ) return false;

    if( Array.isArray( stuff ) ) return isTxWithdrawalsMap( stuff );

    const ks = Object.keys( stuff );

    return ks.every( k => k.length === (28*2) && isHex( k ) && canBeUInteger( stuff[k] ) )
}

export default class TxWithdrawals
    implements ToCbor, ToData, ToJson
{
    readonly map!: TxWithdrawalsMapBigInt

    constructor( map: ITxWithdrawals )
    {
        if( Array.isArray( map ) )
        {
            JsRuntime.assert(
                map.every( entry => (
                    ObjectUtils.hasOwn( entry, "amount" ) &&
                    ObjectUtils.hasOwn( entry, "rewardAccount" ) &&
        
                    entry.rewardAccount instanceof Hash28 &&
                    
                    ((amt) => (
                        (typeof amt === "bigint" && amt >= BigInt( 0 )) ||
                        (typeof amt === "number" && amt === Math.round( Math.abs( amt ) ) ) ||
                        (amt instanceof UInteger)
                    ))(entry.amount)
                
                )),
                "invalid 'TxWithdrawalsMap' passed to construct a 'TxWithdrawals'"
            );

            map.forEach( entry => {
                Object.freeze( entry.rewardAccount );
                Object.freeze( entry.amount );
            });

            ObjectUtils.defineReadOnlyProperty(
                this,
                "map",
                Object.freeze( map )
            );
        }
        else
        {
            const _map: TxWithdrawalsMap = [];

            JsRuntime.assert(
                typeof map === "object",
                "invalid object passed as 'TxWithdrawalsMap' to construct a 'TxWithdrawals'"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "map",
                Object.freeze(
                    Object.keys( map )
                    .map( rewAccount => Object.freeze({
                        rewardAccount: Object.freeze( new Hash28( rewAccount ) ) as any,
                        amount: forceUInteger( map[rewAccount] ).asBigInt
                    }))
                )
            );
        }
    }

    toTotalWitdrawn(): Value
    {
        return Value.lovelaces(
            this.map
            .reduce( (a,b) => a + b.amount , BigInt(0) )
        )
    }

    toData(version?: "v1" | "v2" | undefined): DataMap<DataConstr,DataI>
    {
        return new DataMap(
            this.map
            .map( ({ rewardAccount, amount }) =>
                new DataPair(
                    new StakeCredentials(
                        "stakeKey",
                        new StakeKeyHash( rewardAccount )
                    ).toData(),
                    new DataI( amount )
                )
            )
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborMap(
            this.map.map( entry => {
                return {
                    k: entry.rewardAccount.toCborObj(),
                    v: new CborUInt( entry.amount )
                }
            })
        )
    }

    toJson(): { [rewardAccount: string]: string }
    {
        const json = {};

        for( const { rewardAccount, amount } of this.map )
        {
            ObjectUtils.defineReadOnlyProperty(
                json, rewardAccount.asString, amount.toString()
            );
        }

        return json as any;
    }
}

export function canBeTxWithdrawals( stuff: any ): stuff is (ITxWithdrawals | TxWithdrawals)
{
    return (stuff instanceof TxWithdrawals) || isITxWithdrawals( stuff );
}

export function forceTxWithdrawals( stuff: TxWithdrawals | ITxWithdrawals ): TxWithdrawals
{
    if( stuff instanceof TxWithdrawals ) return stuff;

    return new TxWithdrawals( stuff );
}