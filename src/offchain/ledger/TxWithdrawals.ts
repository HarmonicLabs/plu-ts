import { forceUInteger, UInteger } from "../../types/ints/Integer";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import Coin from "./Coin";
import Hash28 from "../hashes/Hash28/Hash28";

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
}