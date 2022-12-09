import { forceUInteger, UInteger } from "../../types/ints/Integer";
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

export type TxWithdrawalsMapBigInt = {
    rewardAccount: Hash28,
    amount: bigint
}[];

export type TxWithdrawalsMap = {
    rewardAccount: Hash28,
    amount: Coin
}[];

export type ITxWithdrawals
    = { [rewardAccount: string]: Coin }
    | TxWithdrawalsMap;

export default class TxWithdrawals
    implements ToCbor
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
}