import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import type { IProvider } from "../IProvider";
import type { TxBuilder } from "../TxBuilder";
import { ITxBuildArgs, cloneITxBuildArgs } from "../../txBuild";
import { Address, AddressStr, Hash28, IValuePolicyEntry, PlutusScriptType, PoolParams, PubKeyHash, Script, StakeAddress, StakeAddressBech32, StakeCredentials, Tx, TxMetadata, TxMetadatum } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeUInteger, forceBigUInt } from "../../utils/ints";
import { CanBeData } from "../../utils/CanBeData";
import { CanResolveToUTxO } from "../CanResolveToUTxO/CanResolveToUTxO";
import { jsonToMetadata } from "./jsonToMetadata";

/** sync */
interface TxBuilderStep {
}

function cloneStep( step: TxBuilderStep ): TxBuilderStep
{
    return {

    };
}

/** async */
interface TxBuilderTask {
    getPromise: () => Promise<any>
}

function cloneTask( task: TxBuilderTask ): TxBuilderTask
{
    return {
        getPromise: task.getPromise
    };
}

const readonlyValueDescriptor = Object.freeze({
    writable: false,
    enumerable: true,
    configurable: false
});

export class TxBuilderRunner
{
    readonly build!:() => Promise<Tx>

    readonly reset!: () => TxBuilderRunner;
    
    // implied in the `txBuilder`
    // /** alias for `setNetworkId` */
    // readonly addNetworkId: ( id: CanBeUInteger | NetworkT ) => TxBuilderRunner
    // readonly setNetworkId: ( id: CanBeUInteger ) => TxBuilderRunner
    // readonly setNetwork: ( id: CanBeUInteger | NetworkT ) => TxBuilderRunner

    /**
     * @deprecated use `addRequiredSigner` instead
     */
    readonly addSigner!: ( signer: Address | StakeAddress | AddressStr | StakeAddressBech32 ) => TxBuilderRunner
    readonly addRequiredSigner!: ( signer: Address | StakeAddress | AddressStr | StakeAddressBech32 ) => TxBuilderRunner
    /**
     * @deprecated use `addRequiredSignerKey` instead
     */
    readonly addSignerKey!: ( signerKey: Hash28 ) => TxBuilderRunner
    readonly addRequiredSignerKey!: ( signerKey: Hash28 ) => TxBuilderRunner
    
    readonly attachCertificateValidator: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    readonly attachMintingValidator: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    readonly attachSpendingValidator: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    readonly attachWithdrawalValidator: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    
    readonly attachMetadata!: ( label: CanBeUInteger, metadata: TxMetadatum ) => TxBuilderRunner
    readonly attachMetadataJson!: ( label: CanBeUInteger, metadataJson: any ) => TxBuilderRunner
    /** like `attachMetadataJson` but if a strings starts with `0x` is treated as an hexadecimal byte string */
    readonly attachMetadataJsonWithConversion!: ( label: CanBeUInteger, metadataJson: any ) => TxBuilderRunner
    
    readonly setChangeAddress!: ( changeAddr: Address | AddressStr ) => TxBuilderRunner
    
    readonly collectFrom: ( utxos: CanResolveToUTxO[], redeemer?: CanBeData ) => TxBuilderRunner
    
    // readonly compose: ( other: Tx ) => TxBuilderRunner
    
    readonly delegateTo:(
        delegator: StakeAddress | StakeAddressBech32 | StakeCredentials | Script<PlutusScriptType>,
        poolId: Hash28,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly deregisterStake:(
        delegator: StakeAddress | StakeAddressBech32 | StakeCredentials | Script<PlutusScriptType>,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly mintAssets: (
        assets: IValuePolicyEntry,
        redeemer?: CanBeData,
        script_or_ref?: Script | CanResolveToUTxO
    ) => TxBuilderRunner
    // readonly spendUtxo: (
    //     utxo: CanResolveToUTxO,
    //     script_or_refScript?: Script | CanResolveToUTxO,
    //     redeemer?: CanBeData
    // ) => TxBuilderRunner
    readonly withdraw: (
        stakeAddress: StakeAddress | StakeAddressBech32 | StakeCredentials | Script<PlutusScriptType>,
        amount: CanBeUInteger,
        redeemer?: CanBeData
    ) => TxBuilderRunner


    readonly registerPool: ( params: PoolParams ) => TxBuilderRunner
    
    /**
     * @deprecated `registerStake` is unclear; use `registerStakeAddress` instead
     */
    readonly registerStake: ( stakeAddr: StakeAddress | StakeAddressBech32 ) => TxBuilderRunner
    readonly registerStakeAddress: ( stakeAddr: StakeAddress | StakeAddressBech32 ) => TxBuilderRunner

    readonly retirePool: ( poolId: Hash28, epoch: CanBeUInteger ) => TxBuilderRunner
    readonly updatePool: ( poolParams: PoolParams ) => TxBuilderRunner

    /**
     * @deprecated `readFrom` is an ugly name; use `referenceUtxos` instead
     */
    readonly readFrom:( utxos: CanResolveToUTxO[] ) => TxBuilderRunner
    readonly referenceUtxos:( utxos: CanResolveToUTxO[] ) => TxBuilderRunner

    readonly validFrom!:  ( POSIX: CanBeUInteger ) => TxBuilderRunner
    readonly validFromSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner
    readonly invalidBeforeSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner
    readonly validTo!:  ( POSIX: CanBeUInteger ) => TxBuilderRunner
    readonly validToSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner
    readonly invalidAfterSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner

    readonly tasks!: TxBuilderTask[];
    readonly steps!: TxBuilderStep[];
    readonly buildArgs!: ITxBuildArgs;
    
    constructor(
        txBuilder: TxBuilder,
        provider: IProvider
    )
    {
        const self = this;
        const tasks: TxBuilderTask[] = [];
        const steps: TxBuilderStep[] = [];
        let buildArgs: ITxBuildArgs = {} as any;

        Object.defineProperties(
            this, {
                tasks: {
                    get: () => tasks.map( cloneTask ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                steps: {
                    get: () => steps.map( cloneStep ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                buildArgs: {
                    get: () => cloneITxBuildArgs( buildArgs ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                }
            }
        )

        defineReadOnlyProperty(
            this, "reset",
            () => {
                tasks.length = 0;
                steps.length = 0;
                buildArgs = {} as any;
                return self;
            }
        );

        function _addRequiredSignerKey( key: string | Hash28 | Uint8Array ): TxBuilderRunner
        {
            key = new PubKeyHash( key );
            
            if( buildArgs.requiredSigners === undefined )
            {
                buildArgs.requiredSigners = [ key ];
                return self;
            }

            if( !buildArgs.requiredSigners.some( sig => sig.toString() === key.toString() ) )
            {
                buildArgs.requiredSigners.push( key );
            }
            
            return self;
        }
        function _addRequiredSigner( signer: Address | StakeAddress | AddressStr | StakeAddressBech32 ): TxBuilderRunner
        {
            if( typeof signer === "string" )
            {
                if( signer.startsWith("addr") )
                {
                    signer = Address.fromString( signer );
                }
                else if( signer.startsWith("stake") )
                {
                    signer = StakeAddress.fromString( signer );
                }
            }

            if( signer instanceof Address )
            {
                void _addRequiredSignerKey( signer.paymentCreds.hash );
                if(
                    signer.stakeCreds !== undefined &&
                    !Array.isArray( signer.stakeCreds.hash )
                )
                {
                    void _addRequiredSignerKey( signer.stakeCreds.hash );
                }
                return self;
            }

            if( signer instanceof StakeAddress )
            {
                return _addRequiredSignerKey( signer.credentials )
            }

            throw new Error("invalid required signer");
        }

        function _attachMetadata( label: CanBeUInteger, metadatum: TxMetadatum ): TxBuilderRunner
        {            
            const meta = buildArgs.metadata?.metadata;
            
            const labelStr = forceBigUInt(label).toString();
            const labels = Object.keys( meta ?? {} );

            if( labels.length === 0 )
            {
                buildArgs.metadata = new TxMetadata({
                    [labelStr]: metadatum
                });
                return self;
            }

            buildArgs.metadata = new TxMetadata({
                ...meta,
                // if `labelStr` is already present is overridden
                // otherwise is just added
                [labelStr]: metadatum
            });
            return self;
        }
        function _attachMetadataJson( label: CanBeUInteger, json: any ): TxBuilderRunner
        {
            return _attachMetadata( label, jsonToMetadata( json ) )
        }
        function _attachMetadataJsonWithConversion( label: CanBeUInteger, json: any ): TxBuilderRunner
        {
            return _attachMetadata( label, jsonToMetadata( json, true ) )
        }

        function _setChangeAddress( addr: Address | AddressStr ): TxBuilderRunner
        {
            buildArgs.changeAddress = addr;
            return self;
        }

        function _validFromSlot( slot: CanBeUInteger ): TxBuilderRunner
        {
            buildArgs.invalidBefore = forceBigUInt( slot );
            return self;
        }
        function _validFromPOSIX( POSIX: CanBeUInteger ): TxBuilderRunner
        {
            return _validFromSlot( txBuilder.posixToSlot( POSIX ) );
        }

        function _validToSlot( slot: CanBeUInteger ): TxBuilderRunner
        {
            buildArgs.invalidAfter = forceBigUInt( slot );
            return self;
        }
        function _validToPOSIX( POSIX: CanBeUInteger ): TxBuilderRunner
        {
            return _validToSlot( txBuilder.posixToSlot( POSIX ) );
        }

        Object.defineProperties(
            this, {
                addSigner: {
                    value: _addRequiredSigner,
                    ...readonlyValueDescriptor
                },
                addRequiredSigner: {
                    value: _addRequiredSigner,
                    ...readonlyValueDescriptor
                },
                addSignerKey: {
                    value: _addRequiredSignerKey,
                    ...readonlyValueDescriptor
                },
                addRequiredSignerKey: {
                    value: _addRequiredSignerKey,
                    ...readonlyValueDescriptor
                },
                attachMetadata: {
                    value: _attachMetadata,
                    ...readonlyValueDescriptor
                },
                attachMetadataJson: {
                    value: _attachMetadataJson,
                    ...readonlyValueDescriptor
                },
                attachMetadataJsonWithConversion: {
                    value: _attachMetadataJsonWithConversion,
                    ...readonlyValueDescriptor
                },
                setChangeAddress: {
                    value: _setChangeAddress,
                    ...readonlyValueDescriptor
                },
                validFrom: {
                    value: _validFromPOSIX,
                    ...readonlyValueDescriptor
                },
                validFromSlot: {
                    value: _validFromSlot,
                    ...readonlyValueDescriptor
                },
                invalidBeforeSlot: {
                    value: _validFromSlot,
                    ...readonlyValueDescriptor
                },
                validTo: {
                    value: _validToPOSIX,
                    ...readonlyValueDescriptor
                },
                validToSlot: {
                    value: _validToSlot,
                    ...readonlyValueDescriptor
                },
                invalidAfterSlot: {
                    value: _validToSlot,
                    ...readonlyValueDescriptor
                },
            }
        );
    }
}