import { Address, AddressStr, Value, Script, ScriptType } from "@harmoniclabs/cardano-ledger-ts";
import { TxBuilderRunner } from ".";
import { ITxRunnerProvider } from "../IProvider";
import { CanBeUInteger } from "../../utils/ints";
import { CanBeData } from "../../utils/CanBeData";

export abstract class Transaction
{
    private _txRunner: TxBuilderRunner;
    
    constructor(
        provider: ITxRunnerProvider
    )
    {
    }

    sendLovelace(
        address: Address | AddressStr,
        amount: CanBeUInteger,
    )
    {
        this._txRunner.payTo(
            address,
            amount,
            // datum,
            // refScript
        );
        return this;
    };
    sendAsset(
        address: Address | AddressStr,
        amount: CanBeUInteger | Value,
        datum?: CanBeData,
        refScript?: Script<ScriptType.PlutusV2> 
    )
    {
        this._txRunner.payTo(
            address,
            amount,
            datum,
            refScript
        );
        return this;
    };
    // kinda missing
    abstract sendUTxO(): any;
    // got it
    abstract mintAsset(): any;
    // got it
    abstract burnAsset(): any;
    // got it
    abstract setInputs(): any;
    // TODO
    abstract setCollateral(): any;
    // got it
    abstract setRequiredSigners(): any;
    // got it
    abstract setMetadata(): any;
    // got it
    abstract delegateTo(): any;
    // got it
    abstract withdrawRewards(): any;
    // TODO
    abstract registerStake(): any;
    // got it
    abstract deregisterStake(): any;
    // TODO
    abstract registerPool(): any;
    // TODO
    abstract updatePool(): any;
    // TODO
    abstract retirePool(): any;
    abstract setSlotToExpire(): any;
    abstract setTimeToExpirePOSIX(): any;
    abstract setSlotToStart(): any;
    abstract setTimeToStartPOSIX(): any;
}
