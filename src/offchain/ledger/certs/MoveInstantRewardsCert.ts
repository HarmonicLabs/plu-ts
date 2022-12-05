import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import StakeCredentials from "../../credentials/StakeCredentials";
import Value from "../../Value";

export const enum InstantRewardsSource {
    Reserves = 0,
    Treasurery = 1
}

export type RewardsMap = {
    stakeCredentials: StakeCredentials,
    amount: Value
}[]

export default class MoveInstantRewardsCert
{
    readonly source!: InstantRewardsSource;
    /**
     * If the second field is a map, funds are moved to stake credentials,
     * otherwise the funds are given to the other accounting pot
     * (eg. source is Reserve, hence founds are going to treasurery)
     */
    readonly destintaion!: RewardsMap | Value

    constructor( source: InstantRewardsSource, destintaion: RewardsMap | Value )
    {
        JsRuntime.assert(
            source === InstantRewardsSource.Reserves ||
            source === InstantRewardsSource.Treasurery,
            "invalid 'source' while constructing 'MoveInstantRewardsCert'"
        );
        JsRuntime.assert(
            destintaion instanceof Value ||
            (
                Array.isArray( destintaion ) &&
                destintaion.every( entry => (
                    ObjectUtils.hasOwn( entry, "amount" ) &&
                    ObjectUtils.hasOwn( entry, "stakeCredentials" ) &&
                    entry.amount instanceof Value &&
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
}