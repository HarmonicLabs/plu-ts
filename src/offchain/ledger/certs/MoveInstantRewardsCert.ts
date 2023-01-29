import Cbor from "../../../cbor/Cbor";
import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborMap from "../../../cbor/CborObj/CborMap";
import CborNegInt from "../../../cbor/CborObj/CborNegInt";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import BasePlutsError from "../../../errors/BasePlutsError";
import { canBeUInteger, forceBigUInt, forceUInteger } from "../../../types/ints/Integer";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import ToJson from "../../../utils/ts/ToJson";
import StakeCredentials from "../../credentials/StakeCredentials";
import Coin from "../Coin";

export const enum InstantRewardsSource {
    Reserves = 0,
    Treasurery = 1
}

export type RewardSourceToStr<S extends InstantRewardsSource> =
    S extends InstantRewardsSource.Reserves   ? "Reserves" :
    S extends InstantRewardsSource.Treasurery ? "Treasurery" :
    never;

export function rewardSourceToStr<S extends InstantRewardsSource>( source: S ): RewardSourceToStr<S>
{
    switch( source )
    {
        case InstantRewardsSource.Reserves: return "Reserves" as any;
        case InstantRewardsSource.Treasurery: return "Treasurery" as any;
        default:
            throw new BasePlutsError("unknown instant rewards source")
    }
}

export type RewardsMap = {
    stakeCredentials: StakeCredentials,
    amount: number | bigint
}[]

function rewardsMapToCborObj( map: RewardsMap ): CborMap
{
    return new CborMap(
        map.map( entry => {
            const amt = entry.amount;
            return {
                k: entry.stakeCredentials.toCborObj(),
                v: amt < 0 ? new CborNegInt( amt ) : new CborUInt( amt )
            }
        })
    )
}

export default class MoveInstantRewardsCert
    implements ToCbor, ToJson
{
    readonly source!: InstantRewardsSource;
    /**
     * If the second field is a map, funds are moved to stake credentials,
     * otherwise the funds are given to the other accounting pot
     * (eg. source is Reserve, hence founds are going to treasurery)
     */
    readonly destintaion!: RewardsMap | Coin

    constructor( source: InstantRewardsSource, destintaion: RewardsMap | Coin )
    {
        JsRuntime.assert(
            source === InstantRewardsSource.Reserves ||
            source === InstantRewardsSource.Treasurery,
            "invalid 'source' while constructing 'MoveInstantRewardsCert'"
        );
        JsRuntime.assert(
            canBeUInteger( destintaion ) ||
            (
                Array.isArray( destintaion ) &&
                destintaion.every( entry => (
                    ObjectUtils.hasOwn( entry, "amount" ) &&
                    ObjectUtils.hasOwn( entry, "stakeCredentials" ) &&
                    (
                        (typeof (entry.amount) === "number" && entry.amount === Math.round( entry.amount )) ||
                        (typeof (entry.amount) === "bigint")
                    )  &&
                    entry.stakeCredentials instanceof StakeCredentials
                ))
            ),
            "invalid 'destintaiton' while constructing 'MoveInstantRewardsCert'"
        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "source",
            source
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "destintaion",
            destintaion
        );
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborObj
    {
        return new CborArray([
            new CborUInt( this.source ),
            canBeUInteger( this.destintaion ) ?
                new CborUInt( forceUInteger( this.destintaion ).asBigInt ) :
                rewardsMapToCborObj( this.destintaion )
        ]);
    }

    toJson()
    {
        return {
            source: rewardSourceToStr( this.source ),
            destination: canBeUInteger( this.destintaion ) ?
                forceBigUInt( this.destintaion ).toString() :
                this.destintaion.map( ({ stakeCredentials, amount }) => 
                    ({
                        stakeCreds: stakeCredentials.toJson(),
                        amount: forceBigUInt( amount ).toString()
                    })
                )
        };
    }
}