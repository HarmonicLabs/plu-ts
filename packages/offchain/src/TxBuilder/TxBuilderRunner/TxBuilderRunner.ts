import { defineReadOnlyProperty, isObject } from "@harmoniclabs/obj-utils";
import type { ITxRunnerProvider } from "../IProvider";
import type { TxBuilder } from "../TxBuilder";
import { ITxBuildArgs, ITxBuildOutput, NormalizedITxBuildArgs, cloneITxBuildArgs, normalizeITxBuildArgs } from "../../txBuild";
import { Address, AddressStr, CertStakeDelegation, Certificate, Hash28, Hash32, ITxOut, ITxOutRef, IUTxO, IValuePolicyEntry, PlutusScriptType, PoolKeyHash, PoolParams, PubKeyHash, Script, ScriptType, StakeAddress, StakeAddressBech32, Credential, StakeValidatorHash, Tx, TxIn, TxMetadata, TxMetadatum, TxOutRefStr, UTxO, Value, forceTxOutRefStr, isITxOut, isIUTxO, CredentialType, CertStakeDeRegistration, CertStakeRegistration, CertPoolRegistration, IPoolParams, CanBeHash28, CertPoolRetirement, StakeCredentials, ITxWithdrawalsEntry, Vote, IAnchor, IVoter, ProtocolParameters, IProposalProcedure, ITxWithdrawals, TxWithdrawals, INewCommitteeEntry, IConstitution, VotingProcedure, VotingProcedures, forceTxOutRef, IVotingProceduresEntry, TxOutRef, VoterKind, GovActionType, isIVotingProceduresEntry, isIProposalProcedure, eqITxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../utils/ints";
import { CanResolveToUTxO, cloneCanResolveToUTxO, shouldResolveToUTxO } from "../CanResolveToUTxO/CanResolveToUTxO";
import { jsonToMetadata } from "./jsonToMetadata";
import { isGenesisInfos } from "../GenesisInfos";
import { sha2_256 } from "@harmoniclabs/crypto";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { Data, DataI, cloneData, dataToCbor, isData } from "@harmoniclabs/plutus-data";
import { ByteString } from "@harmoniclabs/bytestring";
import { CanBeData, canBeData, forceData } from "../../utils/CanBeData";
import { CanBePoolKeyHash, forcePoolKeyHash } from "./CanBePoolKeyHash";
import { CanBeStakeCreds, forceStakeCreds } from "./CanBeStakeCreds";
import { forceAddr } from "./forceAddr";
import { IProtocolVerision } from "@harmoniclabs/cardano-ledger-ts/dist/ledger/protocol/protocolVersion";
import { Rational } from "../../utils/Rational";
import { eqIVoter } from "../../txBuild/ITxBuildVotingProcedure";

// /** sync */
// interface TxBuilderStep {
// 
// }
// 
// function cloneStep( step: TxBuilderStep ): TxBuilderStep
// {
//     return {
// 
//     };
// }

type SimpleScriptInfos = {
    inline: Script<PlutusScriptType>
    redeemer: CanBeData
} | {
    ref: UTxO;
    redeemer: CanBeData;
};

const enum TxBuilderTaskKind {
    ResolveUTxO = 0,
    ResolveTxIn = 1,
    ValidFromPOSIX = 2,
    ValidToPOSIX = 3,
    DelegateTo = 4,
    DeregisterStake = 5,
    Withdraw = 6,
    RegisterStake = 7,
}

type TxBuilderPromiseTaskKind
    = TxBuilderTaskKind.ValidFromPOSIX
    | TxBuilderTaskKind.ValidToPOSIX
    | TxBuilderTaskKind.DelegateTo
    | TxBuilderTaskKind.DeregisterStake
    | TxBuilderTaskKind.Withdraw;

/** async */
interface TxBuilderPromiseTask {
    kind: TxBuilderTaskKind
    getPromise: () => Promise<void>
}

interface TxBuilderResolveUTxOTask {
    kind: TxBuilderTaskKind.ResolveUTxO,
    arg: ITxOutRef | TxOutRefStr | IUTxO,
    onResolved: ( utxo: UTxO ) => void 
}

interface TxBuilderResolveTxInTask {
    kind: TxBuilderTaskKind.ResolveTxIn,
    arg: ITxOutRef | TxOutRefStr | IUTxO,
    onResolved: ( utxo: TxIn ) => void 
}

type TxBuilderTask
    = TxBuilderPromiseTask
    | TxBuilderResolveUTxOTask
    | TxBuilderResolveTxInTask

function cloneTask( task: TxBuilderTask ): TxBuilderTask
{
    if( task.kind === TxBuilderTaskKind.ResolveUTxO || task.kind === TxBuilderTaskKind.ResolveTxIn )
    {
        const {
            kind,
            arg,
            onResolved
        } = task as TxBuilderResolveUTxOTask;
        return {
            kind: kind,
            arg: cloneCanResolveToUTxO( arg ) as (ITxOutRef | TxOutRefStr),
            onResolved: onResolved
        };
    }

    return {
        kind: task.kind,
        getPromise: task.getPromise
    };
}

const readonlyValueDescriptor = Object.freeze({
    writable: false,
    enumerable: true,
    configurable: false
});

const _datumsCache: { [hash: string]: Data } = {};
const _datumsHashes: string[] = [];

function _saveResolvedDatum( datum: Data, hash?: string ): void
{
    const theData = cloneData( datum );
    const actualHash = toHex( new Uint8Array( sha2_256( dataToCbor( datum ).toBuffer() ) ) );
    const actualHashIdx = _datumsHashes.lastIndexOf( actualHash );
    if( actualHashIdx < 0 )
    {
        _datumsHashes.push( actualHash );
        _datumsCache[ actualHash ] = theData;
    }
    if( hash )
    {
        const hashIdx = _datumsHashes.lastIndexOf( hash );
        if( hashIdx < 0 )
        {
            _datumsHashes.push( hash );
            _datumsCache[ hash ] = theData;
        }
    }
}

function _getResolvedDatum( hash: string ): Data | undefined
{
    // no need to `cloneData` because this datum is used only internally
    return _datumsCache[ hash ];
}

export class TxBuilderRunner
{
    /**
     *  if any unresolved data was passed it is resolved via the provider passed;
     * 
     *  if the method needed are not present on the provider throws an `Error`;
     * 
     *  finalizes the `TxBuilderRunner` instance,
     *  so that it can be re-used for other transactions,
     *  
     *  @returns {Promise<Tx>} a `Tx` instance
     */
    readonly build!:() => Promise<Tx>

    /**
     * clears the `TxBuilderRunner` instance,
     * so that it can be re-used for other transactions,
     * making sure no other action where specified
     *
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly reset!: () => TxBuilderRunner;
    
    /**
     * @deprecated use `addRequiredSigner` instead
     */
    readonly addSigner!: ( signer: Address | StakeAddress | AddressStr | StakeAddressBech32 ) => TxBuilderRunner
    /**
     * adds the **all** credentials of the address to the `requiredSigners`
     * field of a `Tx` instance.
     * 
     * only the signers included in that field are passed to a contract's `ScriptContext`.
     * 
     * that includes payment credentials and, if present, stake credentials.
     * 
     * if you have an address with both payment and stake credentials,
     * but wish only to include one of them,
     * consider using  the `addRequiredSignerKey` method
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly addRequiredSigner!: ( signer: Address | StakeAddress | AddressStr | StakeAddressBech32 ) => TxBuilderRunner
    /**
     * @deprecated use `addRequiredSignerKey` instead
     */
    readonly addSignerKey!: ( signerKey: Hash28 ) => TxBuilderRunner
    /**
     * adds the given key hash to the `requiredSigners` field of a `Tx` instance.
     * 
     * only the signers included in that field are passed to a contract's `ScriptContext`.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly addRequiredSignerKey!: ( signerKey: Hash28 ) => TxBuilderRunner
    
    /** alias for `attachValidator` */
    readonly attachCertificateValidator!: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    /** alias for `attachValidator` */
    readonly attachMintingValidator!: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    /** alias for `attachValidator` */
    readonly attachSpendingValidator!: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    /** alias for `attachValidator` */
    readonly attachWithdrawalValidator!: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    /**
     * includes the script in the witnessSet field of the resulting `Tx`
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly attachValidator!: ( validator: Script<PlutusScriptType> ) => TxBuilderRunner
    
    /**
     * adds a metadata entry for the given `label`,
     * or overrides if the same `label` was already present.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly attachMetadata!: ( label: CanBeUInteger, metadata: TxMetadatum ) => TxBuilderRunner
    /**
     * alias for `attachMetadata`
     * 
     * adds a metadata entry for the given `label`,
     * or overrides if the same `label` was already present.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly setMetadata!: ( label: CanBeUInteger, metadata: TxMetadatum ) => TxBuilderRunner
    /**
     * like [`attachMetadata`](./attachMetadata),
     * adds a metadata entry for the given `label`,
     * or overrides if the same `label` was already present.
     * 
     * `metadataJson` is a jsavascript value converted as follows
     * 
     * - `object` -> `TxMetadatumMap`
     * - `array` -> `TxMetadatumList`
     * - `string` -> `TxMetadatumText`
     * (use `attachMetadataJsonWithConversion`
     * for explicit conversion to `TxMetadatumBytes`
     * or consider using `attachMetadata`)
     * - `number` -> `TxMetadatumInt`
     * - `bigint` -> `TxMetadatumInt`
     * 
     * @returns a reference to the same [`TxBuilderRunner`](./TxBuilderRunner).
     */
    readonly attachMetadataJson!: ( label: CanBeUInteger, metadataJson: any ) => TxBuilderRunner
    /** like `attachMetadataJson` but if a string starts with `0x` is treated as an hexadecimal byte string */
    readonly attachMetadataJsonWithConversion!: ( label: CanBeUInteger, metadataJson: any ) => TxBuilderRunner
    
    /**
     * explicitly sets the change address;
     * 
     * if missing, an attempt to call the `ITxRunnerProvider` `getChangeAddress` method is done
     * 
     * if still missing the first input's address with `PubKeyHash`
     * payment credentials (not script) will be used
     * 
     * if all the above fail, a call to the `build` method will throw an `Error`.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly setChangeAddress!: ( changeAddr: Address | AddressStr ) => TxBuilderRunner

    /**
     * Sets the collateral input, and optionally output, for a transaction.
     * 
     * If this method is not used,
     * but the transaction needs collateral due to the presence of a plutus script,
     * the `TxBuilderRunner` instance will try to use one of the normal inputs as collateral,
     * see `setCollateralAmount`./setCollateralAmount for more infos.
     * 
     * `collateral` can either be a resolved `UTxO`
     * or an unresolved `ITxOutRef`
     * 
     * in case it is an unresolved `ITxOutRef`
     * a call to the `ITxRunnerProvider` `resolveUtxos` method
     * is done in the `build` method;
     * if `resolveUtxos` is missing on the provider the `build` method will throw an `Error`.
     * 
     * an additional `collateralOutput` may be specified.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly setCollateral!: (
        collateral: CanResolveToUTxO,
        collateralOutput?: ITxOut 
    ) => TxBuilderRunner

    /**
     * Sets the collateral amount for a transaction.
     * 
     * If `setCollateral` is not used, 
     * but the transaction needs collateral due to the presence of a plutus script,
     * the `TxBuilderRunner` instance will try to use one of the normal inputs as collateral.
     * 
     * In case this happens, it is possible to limit the amount of the collateral using this method.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
    **/
    readonly setCollateralAmount!: ( lovelaces: CanBeUInteger ) => TxBuilderRunner
    
    /**
     * @deprecated `collectFrom` is unclear; use `addInputs` instead.
     */
    readonly collectFrom!: ( utxos: CanResolveToUTxO[], redeemer?: CanBeData ) => TxBuilderRunner
    /**
     * adds the given `utxos` to the transaction inputs;
     * the elements of the array that don't satisfy the `IUTxO` interface
     * will be resolved using the provider `resolveUtxos` method.
     * 
     * this method does not allow to specify plutus realated arguments.
     * 
     * for inputs that need redeemers, scripts and datums use `addInput`.
     * 
     * @returns a reference to the same `TxBuilderRunner`.
    **/
    readonly addInputs!: (
        utxos: CanResolveToUTxO[]
        // redeemer?: CanBeData,
        // script_or_ref?: CanResolveToUTxO | Script<PlutusScriptType>,
        // datum?: CanBeData
    ) => TxBuilderRunner
    /**
     * adds the given `utxo` to the transaction inputs;
     * if`utxo` doesn't satisfy the `IUTxO` interface
     * it will be resolved using the provider `resolveUtxos` method.
     * 
     * `redeemer` and `script_or_ref` must be specified together;
     * if `datum` is missing defaults to `"inline"`.
     * 
     * if `script_or_ref` is a `Script`
     * it will be included in the `witnesses`
     * field of the resulting `Tx`;
     * 
     * if `script_or_ref` satisfies the `IUTxO` interface
     * it will be used as reference input to provide the attached reference script
     * (`build` fails if missing)
     * 
     * if `script_or_ref` satisfies the `ITxOutRef` interface
     * or the `TxOutRefStr` type alias
     * it will be resolved using the provider `resolveUtxos` method and
     * it will be used as reference input to provide the attached reference script
     * (`build` fails if missing)
     * 
     * @returns a reference to the same `TxBuilderRunner`.
    **/
    readonly addInput!: (
        utxos: CanResolveToUTxO,
        redeemer?: CanBeData,
        script_or_ref?: CanResolveToUTxO | Script<PlutusScriptType>,
        datum?: CanBeData | "inline"
    ) => TxBuilderRunner
    
    /**
     * adds a transaction output.
     * 
     * if `amount` is `number` or `bigint` it is intended to be lovelaces only.
     * 
     * if `datum` is present is always added as inline datum.
     * 
     * @param address receiver address
     * @param amount Value to sent
     * @param datum optional inline datum to attach
     * @param refScript optional reference script to attach
     * @returns a reference to the same `TxBuilderRunner`.
     */
    readonly payTo: (
        address: Address | AddressStr,
        amount: CanBeUInteger | Value,
        datum?: CanBeData,
        refScript?: Script<ScriptType.PlutusV2> 
    ) => TxBuilderRunner

    // readonly compose: ( other: Tx ) => TxBuilderRunner
    readonly mintAssets: (
        assets: IValuePolicyEntry,
        script_or_ref: Script | CanResolveToUTxO,
        redeemer?: CanBeData,
    ) => TxBuilderRunner
    readonly withdraw!: (
        stakeAddress: CanBeStakeCreds,
        amount: CanBeUInteger,
        redeemer?: CanBeData,
        script_or_ref?: Script | CanResolveToUTxO
    ) => TxBuilderRunner

    // certificates

    readonly delegateTo!:(
        delegator: CanBeStakeCreds,
        poolId: CanBePoolKeyHash,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly registerPool!: ( params: IPoolParams ) => TxBuilderRunner
    readonly retirePool!: ( poolId: CanBeHash28, epoch: CanBeUInteger ) => TxBuilderRunner
    readonly registerStake!: (
        delegator: CanBeStakeCreds,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly registerStakeAddress!: (
        delegator: CanBeStakeCreds,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly deregisterStake!:(
        delegator: CanBeStakeCreds,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner

    /**
     * @deprecated `readFrom` is an ugly name; use `referenceUtxos` instead
     */
    readonly readFrom!:( utxos: CanResolveToUTxO[] ) => TxBuilderRunner
    readonly referenceUtxos!:( utxos: CanResolveToUTxO[] ) => TxBuilderRunner

    readonly validFrom!:  ( POSIX: CanBeUInteger ) => TxBuilderRunner
    readonly validFromSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner
    readonly invalidBeforeSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner
    readonly validTo!:  ( POSIX: CanBeUInteger ) => TxBuilderRunner
    readonly validToSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner
    readonly invalidAfterSlot!: ( slot: CanBeUInteger ) => TxBuilderRunner

    readonly vote: (
        voter: IVoter,
        governanceActionId: ITxOutRef | TxOutRefStr,
        vote: Vote,
        anchor?: IAnchor | undefined,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly voteDRep: (
        drepKeyHash: CanBeHash28,
        governanceActionId: ITxOutRef | TxOutRefStr,
        vote: Vote,
        anchor?: IAnchor | undefined
    ) => TxBuilderRunner
    readonly voteScriptDRep: (
        drepScriptHash: CanBeHash28,
        governanceActionId: ITxOutRef | TxOutRefStr,
        vote: Vote,
        anchor?: IAnchor | undefined,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly voteConstitutionalComittee: (
        memberKeyHash: CanBeHash28,
        governanceActionId: ITxOutRef | TxOutRefStr,
        vote: Vote,
        anchor?: IAnchor | undefined
    ) => TxBuilderRunner
    readonly voteScriptConstitutionalComittee: (
        memberScriptHash: CanBeHash28,
        governanceActionId: ITxOutRef | TxOutRefStr,
        vote: Vote,
        anchor?: IAnchor | undefined,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly voteStakePool: (
        poolId: CanBeHash28,
        governanceActionId: ITxOutRef | TxOutRefStr,
        vote: Vote,
        anchor?: IAnchor | undefined
    ) => TxBuilderRunner

    readonly propose: (
        proposal: IProposalProcedure,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeParametersChanges: (
        changes: Partial<ProtocolParameters>,
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        govActionId?: ITxOutRef | TxOutRefStr,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeHardForkInitiation: (
        nextProtocolVersion: IProtocolVerision,
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        govActionId?: ITxOutRef | TxOutRefStr,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeTreasuryWithdrawal: (
        withdrawals: ITxWithdrawals | TxWithdrawals,
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeNoConfidence: (
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        govActionId?: ITxOutRef | TxOutRefStr,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeComitteeUpdate: (
        toRemove: Credential[],
        toAdd: INewCommitteeEntry[],
        threshold: Rational,
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        govActionId?: ITxOutRef | TxOutRefStr,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeNewConstitution: (
        constitution: IConstitution,
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        govActionId?: ITxOutRef | TxOutRefStr,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner
    readonly proposeInfos: (
        procedureInfos: Omit<IProposalProcedure,"govAction">,
        redeemer?: CanBeData,
        script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
    ) => TxBuilderRunner

    readonly tasks!: TxBuilderTask[];
    readonly buildArgs!: NormalizedITxBuildArgs;
    
    constructor(
        txBuilder: TxBuilder,
        provider: Partial<ITxRunnerProvider>
    )
    {
        if( !isObject( provider ) ) provider = {};

        const self = this;
        let tasks: TxBuilderTask[] = [];
        let buildArgs: ITxBuildArgs = {} as any;
        const scripts: Script[] = [];
        const scriptHashesStr: string[] = [];
        const refUtxos: UTxO[] = [];

        let _collateralAmount: CanBeUInteger = 5_000_000;
        let _setCollateralTask: TxBuilderResolveUTxOTask | undefined = undefined;

        defineReadOnlyProperty(
            this, "reset",
            () => {
                tasks.length = 0;
                // steps.length = 0;
                buildArgs = {} as any;
                scripts.length = 0;
                scriptHashesStr.length = 0;
                refUtxos.length = 0;
                _collateralAmount = 5_000_000;
                _setCollateralTask = undefined;
                return self;
            }
        );

        function _addRefUtxo( u: CanResolveToUTxO ): void
        {
            if( isIUTxO( u ) )
            {
                refUtxos.push( new UTxO( u ) );
                return;
            }
            // add before other resolveUtxOs (`unshift`)
            tasks.unshift({
                kind: TxBuilderTaskKind.ResolveUTxO,
                arg: u,
                onResolved: ( utxo ) => refUtxos.push( utxo )
            });
        }

        function _addAviableScript( scrpt: Script ): TxBuilderRunner
        {
            const hStr = scrpt.hash.toString();

            if( !scriptHashesStr.includes( hStr ) )
            {
                scripts.push( scrpt );
                scriptHashesStr.push( hStr );
            }

            return self;
        }

        Object.defineProperties(
            this, {
                tasks: {
                    get: () => tasks.map( cloneTask ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                // steps: {
                //     get: () => steps.map( cloneStep ),
                //     set: () => {},
                //     enumerable: true,
                //     configurable: false
                // },
                buildArgs: {
                    get: () => normalizeITxBuildArgs( buildArgs ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                }
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
                else throw new Error("invalid string passed as address: " + signer)
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
            tasks = tasks.filter( ({ kind }) => kind !== TxBuilderTaskKind.ValidFromPOSIX );
            buildArgs.invalidBefore = forceBigUInt( slot );
            return self;
        }
        function _validFromPOSIX( POSIX: CanBeUInteger ): TxBuilderRunner
        {
            tasks.push({
                kind: TxBuilderTaskKind.ValidFromPOSIX,
                getPromise: async () => {
                    if( !isGenesisInfos( txBuilder.genesisInfos ) )
                    {
                        if( typeof provider.getGenesisInfos !== "function" )
                        {
                            throw new Error(
                                "validFromPOSIX requires either a tx builder with genesis infos or a provider that can fetch them; but none is present"
                            );
                        }
                        txBuilder.setGenesisInfos(
                            await provider.getGenesisInfos()
                        )
                    }
                    buildArgs.invalidBefore = forceBigUInt( txBuilder.posixToSlot( POSIX ) );
                }
            })
            return self;
        }

        function _validToSlot( slot: CanBeUInteger ): TxBuilderRunner
        {
            tasks = tasks.filter( ({ kind }) => kind !== TxBuilderTaskKind.ValidToPOSIX );
            buildArgs.invalidAfter = forceBigUInt( slot );
            return self;
        }
        function _validToPOSIX( POSIX: CanBeUInteger ): TxBuilderRunner
        {
            tasks.push({
                kind: TxBuilderTaskKind.ValidToPOSIX,
                getPromise: async () => {
                    if( !isGenesisInfos( txBuilder.genesisInfos ) )
                    {
                        if( typeof provider.getGenesisInfos !== "function" )
                        {
                            throw new Error(
                                "validToPOSIX requires either a tx builder with genesis infos or a provider that can fetch them; but none is present"
                            );
                        }
                        txBuilder.setGenesisInfos(
                            await provider.getGenesisInfos()
                        )
                    }
                    buildArgs.invalidAfter = forceBigUInt( txBuilder.posixToSlot( POSIX ) );
                }
            })
            return self;
        }

        function _referenceUTxOs( utxos: CanResolveToUTxO[] ): TxBuilderRunner
        {
            if( utxos.length <= 0 ) return self;

            for( const u of utxos )
            {
                _addRefUtxo( u );
            }

            return self;
        }

        function _addCertificate(
            cert: Certificate, 
            script?: SimpleScriptInfos
        ): void
        {
            if(!(buildArgs.certificates))
            {
                buildArgs.certificates = [{
                    cert,
                    script
                }];
                return;
            }
            else
            {
                buildArgs.certificates.push({
                    cert,
                    script
                });
            }
        }

        function _addWithdraw(
            withdrawal: ITxWithdrawalsEntry,
            script?: SimpleScriptInfos
        ): void
        {
            if(!(buildArgs.withdrawals))
            {
                buildArgs.withdrawals = [{
                    withdrawal,
                    script
                }];
                return;
            }
            else
            {
                buildArgs.withdrawals.push({
                    withdrawal,
                    script
                });
            }
        }

        function _tryGetRefScript( scriptHashStr: string ): UTxO | undefined
        {
            const theRef = refUtxos.find( ref => ref.resolved.refScript?.hash?.toString() === scriptHashStr );
            
            if( theRef === undefined ) return undefined;
            return theRef;
        }

        function _tryGetScript( scriptHashStr: string ): Script<PlutusScriptType> | undefined
        {
            const theScript = scripts.find( scr => scr.hash.toString() === scriptHashStr );
            
            if( theScript === undefined ) return undefined;
            return theScript as Script<PlutusScriptType>;
        }

        function _tryGetRefStakeScript( stakeCreds: Credential ): UTxO | undefined
        {
            const scriptHash = stakeCreds.hash;

            if( Array.isArray( scriptHash ) ) return undefined
            
            return _tryGetRefScript( scriptHash.toString() );
        }

        function _tryGetStakeScript( stakeCreds: Credential ): Script<PlutusScriptType> | undefined
        {
            const scriptHash = stakeCreds.hash;

            if( Array.isArray( scriptHash ) ) return undefined;
            
            return _tryGetScript( scriptHash.toString() );
        }

        function _ensureStakeScript(
            stakeCreds: Credential,
            script_or_ref: CanResolveToUTxO | Script<PlutusScriptType> | undefined,
            redeemer: CanBeData | undefined,
            script: SimpleScriptInfos | undefined
        ): SimpleScriptInfos 
        {
            if( stakeCreds.type === CredentialType.Script )
            {
                if( redeemer === undefined )
                {
                    throw new Error("stake credenials are \"script\" but \"redeemer\" is missing");
                }

                if( shouldResolveToUTxO( script_or_ref ) )
                {
                    throw new Error("unresolved TxOutRef used as ref UTxO");
                }

                if( !( script ) )
                {
                    script_or_ref = _tryGetRefStakeScript( stakeCreds );

                    if( script_or_ref === undefined )
                    {
                        script_or_ref = _tryGetStakeScript( stakeCreds );
                    }
                    
                    if( script_or_ref === undefined )
                    {
                        throw new Error("missing script with hash: " + stakeCreds.hash );
                    }

                    if( isIUTxO( script_or_ref ) )
                    {
                        script = {
                            ref: new UTxO( script_or_ref ),
                            redeemer
                        }
                    }
                    else
                    {
                        script = {
                            inline: script_or_ref,
                            redeemer
                        }
                    }
                }
            }

            return script!;
        }
        
        function _delegateTo(
            delegator: CanBeStakeCreds,
            poolId: CanBePoolKeyHash,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            const stakeCreds: Credential = forceStakeCreds( delegator );
            const poolKeyHash: PoolKeyHash = forcePoolKeyHash( poolId );

            let script: undefined | SimpleScriptInfos = undefined;

            if(
                delegator instanceof Script &&
                ( script_or_ref === undefined || script_or_ref instanceof Script )
            )
            {
                script_or_ref = delegator
            }

            if( stakeCreds.type === CredentialType.Script )
            {
                if( redeemer === undefined )
                {
                    throw new Error("in \"delegateTo\"; stake credenials are \"script\" but \"redeemer\" is missing");
                }

                if( shouldResolveToUTxO( script_or_ref ) )
                {
                    _addRefUtxo
                    tasks.unshift({
                        kind: TxBuilderTaskKind.ResolveUTxO,
                        arg: script_or_ref,
                        onResolved: (utxo) => {
                            script_or_ref = utxo;
                            script = {
                                ref: utxo,
                                redeemer
                            };
                        }
                    });
                }
            }
            
            tasks.push({
                kind: TxBuilderTaskKind.DelegateTo,
                getPromise: async () => {

                    script = _ensureStakeScript(
                        stakeCreds,
                        script_or_ref,
                        redeemer,
                        script
                    );

                    _addCertificate(
                        new CertStakeDelegation({
                            stakeCredential: stakeCreds,
                            poolKeyHash
                        }),
                        script
                    );
                }
            });

            return self;
        }

        function _deregisterStake(
            delegator: CanBeStakeCreds,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            const stakeCreds: Credential = forceStakeCreds( delegator );

            let script: undefined | SimpleScriptInfos = undefined;

            if(
                delegator instanceof Script &&
                ( script_or_ref === undefined || script_or_ref instanceof Script )
            )
            {
                script_or_ref = delegator
            }

            if( stakeCreds.type === CredentialType.Script )
            {
                if( redeemer === undefined )
                {
                    throw new Error("in \"deregisterStake\"; stake credenials are \"script\" but \"redeemer\" is missing");
                }

                if( shouldResolveToUTxO( script_or_ref ) )
                {
                    tasks.push({
                        kind: TxBuilderTaskKind.ResolveUTxO,
                        arg: script_or_ref,
                        onResolved: (utxo) => {
                            script_or_ref = utxo;
                            script = {
                                ref: utxo,
                                redeemer
                            };
                        }
                    });
                }
            }
            
            tasks.push({
                kind: TxBuilderTaskKind.DeregisterStake,
                getPromise: async () => {

                    script = _ensureStakeScript(
                        stakeCreds,
                        script_or_ref,
                        redeemer,
                        script
                    );

                    _addCertificate(
                        new CertStakeDeRegistration({
                            stakeCredential: stakeCreds,
                        }),
                        script
                    );
                }
            });

            return self;
        }

        function _registerStake(
            delegator: CanBeStakeCreds,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            const stakeCreds: Credential = forceStakeCreds( delegator );

            let script: undefined | SimpleScriptInfos = undefined;

            if(
                delegator instanceof Script &&
                ( script_or_ref === undefined || script_or_ref instanceof Script )
            )
            {
                script_or_ref = delegator
            }

            if( stakeCreds.type === CredentialType.Script )
            {
                if( redeemer === undefined )
                {
                    throw new Error("in \"registerStake\"; stake credenials are \"script\" but \"redeemer\" is missing");
                }

                if( shouldResolveToUTxO( script_or_ref ) )
                {
                    tasks.push({
                        kind: TxBuilderTaskKind.ResolveUTxO,
                        arg: script_or_ref,
                        onResolved: (utxo) => {
                            script_or_ref = utxo;
                            script = {
                                ref: utxo,
                                redeemer
                            };
                        }
                    });
                }
            }
            
            tasks.push({
                kind: TxBuilderTaskKind.RegisterStake,
                getPromise: async () => {

                    script = _ensureStakeScript(
                        stakeCreds,
                        script_or_ref,
                        redeemer,
                        script
                    );

                    _addCertificate(
                        new CertStakeRegistration({
                            stakeCredential: stakeCreds,
                        }),
                        script
                    );
                }
            });

            return self;
        }

        function _registerPool( poolParams: IPoolParams | PoolParams ): TxBuilderRunner
        {
            _addCertificate(
                new CertPoolRegistration({
                    poolParams: new PoolParams( poolParams )
                })
            );
            return self;
        }

        function _retirePool( poolId: CanBeHash28, epoch: CanBeUInteger ): TxBuilderRunner
        {
            _addCertificate(
                new CertPoolRetirement( {
                    poolHash: new PoolKeyHash( poolId ),
                    epoch 
                })
            );
            return self;
        }

        function _withdraw(
            stakeAddress: CanBeStakeCreds,
            amount: CanBeUInteger,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            const stakeCreds: Credential = forceStakeCreds( stakeAddress );

            let script: undefined | SimpleScriptInfos = undefined;

            if(
                stakeAddress instanceof Script &&
                ( script_or_ref === undefined || script_or_ref instanceof Script )
            )
            {
                script_or_ref = stakeAddress
            }

            if( stakeCreds.type === CredentialType.Script )
            {
                if( redeemer === undefined )
                {
                    throw new Error("in \"withdraw\"; stake credenials are \"script\" but \"redeemer\" is missing");
                }

                if( shouldResolveToUTxO( script_or_ref ) )
                {
                    tasks.push({
                        kind: TxBuilderTaskKind.ResolveUTxO,
                        arg: script_or_ref,
                        onResolved: (utxo) => {
                            script_or_ref = utxo;
                            script = {
                                ref: utxo,
                                redeemer
                            };
                        }
                    });
                }
            }
            
            tasks.push({
                kind: TxBuilderTaskKind.Withdraw,
                getPromise: async () => {

                    script = _ensureStakeScript(
                        stakeCreds,
                        script_or_ref,
                        redeemer,
                        script
                    );

                    if( Array.isArray( stakeCreds.hash ) )
                    {
                        throw new Error("unexpected pointer stake credentials");
                    }

                    _addWithdraw(
                        {
                            rewardAccount: stakeCreds.hash,
                            amount
                        },
                        script
                    );
                }
            });

            return self;
        }

        function _pushInput(
            utxo: UTxO,
            redeemer?: CanBeData,
            script_or_ref?: IUTxO | Script<PlutusScriptType>
        ): void
        {
            const paymentCreds = utxo.resolved.address.paymentCreds;
            if( paymentCreds.type === CredentialType.Script )
            {
                if( !canBeData( redeemer ) ) throw new Error("script input " + utxo.utxoRef.toString() + " is missing a redeemer");
                else redeemer = forceData( redeemer );

                if( isIUTxO( script_or_ref ) )
                {
                    refUtxos.push( new UTxO( script_or_ref ) );
                }

                if( script_or_ref instanceof Script )
                {
                    _addAviableScript( script_or_ref )
                }

                if( !isIUTxO( script_or_ref ) || !( script_or_ref instanceof Script ) )
                {
                    const scriptHash = paymentCreds.hash.toString();
                    script_or_ref = _tryGetRefScript( scriptHash ) ?? _tryGetScript( scriptHash );

                    if( !!isIUTxO( script_or_ref ) || !( script_or_ref instanceof Script ) )
                    {
                        throw new Error("script input " + utxo.utxoRef.toString() + " is missing the script source");
                    }
                }

                if( !Array.isArray( buildArgs.inputs ) )
                {
                    buildArgs.inputs = [] as any;
                }

                const isInlineDatum = isData( utxo.resolved.datum );

                const datumHashStr = utxo.resolved.datum?.toString() ?? "undefined"; 
                const datum = 
                    ByteString.isValidHexValue( datumHashStr ) && 
                    datumHashStr.length === 64 ? 
                    _getResolvedDatum( datumHashStr ) : undefined;

                if( !isInlineDatum && !isData( datum ) )
                throw new Error("missing datum for script input " + + utxo.utxoRef.toString());
                
                if( isIUTxO( script_or_ref )  )
                {
                    const ref = script_or_ref instanceof UTxO ? script_or_ref : new UTxO( script_or_ref ); 

                    buildArgs.inputs.push({
                        utxo,
                        referenceScript: {
                            refUtxo: ref,
                            redeemer,
                            datum: isInlineDatum ? "inline" : datum as Data
                        }
                    });
                }
                else
                {
                    buildArgs.inputs.push({
                        utxo,
                        inputScript: {
                            script: script_or_ref as Script,
                            redeemer,
                            datum: isInlineDatum ? "inline" : datum as Data
                        }
                    });
                }

                return;
            }
            
            // not script
            if( !Array.isArray( buildArgs.inputs ) )
            {
                buildArgs.inputs = [{ utxo }]
            }
            else
            {
                buildArgs.inputs.push({ utxo });
            }
        }

        function _addInput(
            utxo: IUTxO,
            redeemer: CanBeData | undefined,
            script_or_ref: IUTxO | Script<PlutusScriptType> | undefined,
            datum?: CanBeData | undefined
        ): void
        {
            if( canBeData( datum ) ) _saveResolvedDatum( forceData( datum ) );

            utxo = utxo instanceof UTxO ? utxo : new UTxO( utxo );
            const paymentCreds = (utxo as UTxO).resolved.address.paymentCreds;
            if( paymentCreds.type === CredentialType.Script )
            {
                const hashStr = paymentCreds.hash.toString();
                
                if( !isIUTxO( script_or_ref ) ) script_or_ref = _tryGetRefScript( hashStr ) ?? script_or_ref;
                if( !script_or_ref ) script_or_ref = _tryGetScript( hashStr );
                if( !script_or_ref ) throw new Error("missing script for utxo: " + (utxo as UTxO).utxoRef.toString() );

                if( isIUTxO( script_or_ref ) ) script_or_ref = new UTxO( script_or_ref );
            }

            _pushInput( utxo as UTxO, redeemer, script_or_ref );
        }

        function __addInptus(
            utxos: CanResolveToUTxO[],
            redeemer?: CanBeData,
            script_or_ref?: IUTxO | Script<PlutusScriptType>,
            datum?: CanBeData
        ): TxBuilderRunner
        {
            // save datum before resolving utxo
            if( canBeData( datum ) ) _saveResolvedDatum( forceData( datum ) );

            for( const _utxo of utxos )
            {
                tasks.push({
                    kind: TxBuilderTaskKind.ResolveTxIn,
                    arg: _utxo,
                    onResolved: ( txIn ) => {
                        _addInput( txIn, redeemer, script_or_ref );
                    }
                });
            }    
            return self;
        }
        function _addInputs(
            utxos: CanResolveToUTxO[],
            redeemer?: CanBeData,
            script_or_ref?: CanResolveToUTxO | Script<PlutusScriptType>,
            datum?: CanBeData | "inline",
        ): TxBuilderRunner
        {
            datum = datum === "inline" ? undefined : datum;
            if( shouldResolveToUTxO( script_or_ref ) )
            {
                // save datum before resolving utxo
                if( canBeData( datum ) ) _saveResolvedDatum( forceData( datum ) );

                tasks.push({
                    kind: TxBuilderTaskKind.ResolveUTxO,
                    arg: script_or_ref,
                    onResolved: ( ref ) => {
                        __addInptus( utxos, redeemer, ref );
                    }
                });
                
                return self;
            }
            return __addInptus( utxos, redeemer, script_or_ref, datum );
        }

        function _addSingleInput(
            utxo: CanResolveToUTxO,
            redeemer?: CanBeData,
            script_or_ref?: CanResolveToUTxO | Script<PlutusScriptType>,
            datum?: CanBeData | "inline",
        ): TxBuilderRunner
        {
            return _addInputs(
                [ utxo ],
                redeemer,
                script_or_ref,
                datum
            )
        }

        function _payTo(
            address: Address | AddressStr,
            amount: CanBeUInteger | Value,
            datum?: CanBeData,
            refScript?: Script<ScriptType.PlutusV2> 
        ): TxBuilderRunner
        {
            if( !Array.isArray( buildArgs.outputs ) )
            {
                buildArgs.outputs = [];
            }

            buildArgs.outputs.push({
                address: typeof address === "string" ? Address.fromString( address ) : address,
                value: canBeUInteger( amount ) ? Value.lovelaces( amount ) : amount,
                datum: datum !== undefined && canBeData( datum ) ? forceData( datum ) : undefined,
                refScript
            });

            return self;
        }

        function _setCollateral(
            collateral: CanResolveToUTxO,
            collateralOutput?: ITxOut
        ): TxBuilderRunner
        {
            _setCollateralTask = {
                kind: TxBuilderTaskKind.ResolveUTxO,
                arg: collateral,
                onResolved: utxo => {

                    if( !Value.isAdaOnly( utxo.resolved.value ) && !isITxOut( collateralOutput ) )
                    {
                        collateralOutput = {
                            address: utxo.resolved.address,
                            value: Value.sub(
                                utxo.resolved.value,
                                Value.lovelaces( forceBigUInt( _collateralAmount ) )
                            )
                        };
                    }

                    buildArgs.collaterals = [ utxo ];
                    if( isITxOut( collateralOutput ) )
                    {
                        if( typeof collateralOutput.address === "string" ) 
                        collateralOutput.address = Address.fromString( collateralOutput.address );
                        
                        buildArgs.collateralReturn = collateralOutput as ITxBuildOutput;
                    }
                }
            }
            return self;
        }

        function _setCollateralAmount( amount: CanBeUInteger ): TxBuilderRunner
        {
            if( canBeUInteger( amount ) ) _collateralAmount = amount;
            return self;
        }

        function __mintAssets(
            assets: IValuePolicyEntry,
            script_or_ref: Script | IUTxO,
            redeemer?: CanBeData,
        ): TxBuilderRunner
        {
            redeemer = redeemer === undefined ? new DataI( 0 ) : forceData( redeemer );

            if( !Array.isArray( buildArgs.mints ) )
            {
                buildArgs.mints = [];
            }

            buildArgs.mints.push({
                value: assets,
                script: isIUTxO( script_or_ref ) ?
                {
                    ref: new UTxO( script_or_ref ),
                    // policyId: assets.policy,
                    redeemer
                } : {
                    inline: script_or_ref as Script,
                    // policyId: assets.policy,
                    redeemer
                }
            });

            return self;
        }

        function _mintAssets(
            assets: IValuePolicyEntry,
            script_or_ref: Script | CanResolveToUTxO,
            redeemer?: CanBeData,
        ): TxBuilderRunner
        {
            if( shouldResolveToUTxO( script_or_ref ) )
            {
                tasks.push({
                    kind: TxBuilderTaskKind.ResolveUTxO,
                    arg: script_or_ref,
                    onResolved: ( ref ) => {
                        __mintAssets( assets, ref, redeemer )
                    }
                });
                
                return self;
            }
            else return __mintAssets( assets, script_or_ref, redeemer );
        }

        function __vote(
            voter: IVoter,
            govActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined,
            redeemer?: Data,
            script_or_ref?: Script<PlutusScriptType> | IUTxO
        ): TxBuilderRunner
        {
            govActionId = forceTxOutRef( govActionId ) ;

            if( !Array.isArray( buildArgs.votingProcedures ) )
            buildArgs.votingProcedures = [];
        
            const govActionVote = {
                govActionId,
                vote: {
                    vote,
                    anchor
                },
            };
            const votingProcedure: IVotingProceduresEntry = {
                voter,
                votes: [ govActionVote ]
            };

            const entry = buildArgs.votingProcedures.find( elem => {
                const votingProcedure = isIVotingProceduresEntry( elem ) ? elem : elem.votingProcedure;
                return eqIVoter( voter, votingProcedure.voter );
            });
            if( !entry )
            {
                buildArgs.votingProcedures.push({
                    votingProcedure,
                    script: redeemer === undefined ? undefined : 
                    isIUTxO( script_or_ref ) ? {
                        ref: script_or_ref,
                        redeemer 
                    } : (
                        script_or_ref instanceof Script ? {
                            inline: script_or_ref,
                            redeemer
                        } : undefined
                    )
                })
            }
            else
            {
                const votingProcedure = isIVotingProceduresEntry( entry ) ? entry : entry.votingProcedure;
                const govActionEntry = votingProcedure.votes.find(({ govActionId: entryGovActionId }) => 
                    eqITxOutRef(
                        govActionId as ITxOutRef,
                        entryGovActionId
                    )
                );
                if( !govActionEntry )
                {
                    votingProcedure.votes.push( govActionVote )
                }
                else
                {
                    govActionEntry.vote = {
                        vote,
                        anchor
                    };
                }
            }

            return self;
        }

        function _vote(
            voter: IVoter,
            governanceActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            redeemer = canBeData( redeemer ) ? forceData( redeemer ) : undefined;
            if( shouldResolveToUTxO( script_or_ref ) )
            {
                tasks.push({
                    kind: TxBuilderTaskKind.ResolveUTxO,
                    arg: script_or_ref,
                    onResolved: ( ref ) => {
                        __vote(
                            voter,
                            governanceActionId,
                            vote,
                            anchor,
                            redeemer as (Data | undefined),
                            ref
                        )
                    }
                });
                
                return self;
            }
            else return __vote(
                voter,
                governanceActionId,
                vote,
                anchor,
                redeemer as (Data | undefined),
                script_or_ref
            );
        }


        function _voteDRep(
            drepKeyHash: CanBeHash28,
            governanceActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined
        ): TxBuilderRunner
        {
            return _vote(
                {
                    kind: VoterKind.DRepKeyHash,
                    hash: drepKeyHash
                },
                governanceActionId,
                vote,
                anchor
            );
        }
        function _voteScriptDRep(
            drepScriptHash: CanBeHash28,
            governanceActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _vote(
                {
                    kind: VoterKind.DRepScript,
                    hash: drepScriptHash
                },
                governanceActionId,
                vote,
                anchor,
                redeemer,
                script_or_ref
            );
        }
        function _voteConstitutionalComittee(
            memberKeyHash: CanBeHash28,
            governanceActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined
        ): TxBuilderRunner
        {
            return _vote(
                {
                    kind: VoterKind.ConstitutionalCommitteKeyHash,
                    hash: memberKeyHash
                },
                governanceActionId,
                vote,
                anchor
            );
        }
        function _voteScriptConstitutionalComittee(
            memberScriptHash: CanBeHash28,
            governanceActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _vote(
                {
                    kind: VoterKind.ConstitutionalCommitteScript,
                    hash: memberScriptHash
                },
                governanceActionId,
                vote,
                anchor,
                redeemer,
                script_or_ref
            );
        }
        function _voteStakePool(
            poolId: CanBeHash28,
            governanceActionId: ITxOutRef | TxOutRefStr,
            vote: Vote,
            anchor?: IAnchor | undefined
        ): TxBuilderRunner
        {
            return _vote(
                {
                    kind: VoterKind.StakingPoolKeyHash,
                    hash: poolId
                },
                governanceActionId,
                vote,
                anchor
            );
        }

        function __propose(
            proposal: IProposalProcedure,
            redeemer?: Data,
            script_or_ref?: Script<PlutusScriptType> | IUTxO
        ): TxBuilderRunner
        {
            if( !Array.isArray( buildArgs.proposalProcedures ) )
            buildArgs.proposalProcedures = [];

            buildArgs.proposalProcedures.push({
                proposalProcedure: proposal,
                script: redeemer === undefined ? undefined :
                isIUTxO( script_or_ref ) ? {
                    ref: script_or_ref,
                    redeemer
                } : (
                    (script_or_ref instanceof Script) ? {
                        inline: script_or_ref,
                        redeemer
                    } : undefined
                )
            })

            const _proposalProcedure = buildArgs.proposalProcedures[ buildArgs.proposalProcedures.length - 1 ];
            const govActionRef = isIProposalProcedure( _proposalProcedure ) ?
                _proposalProcedure.govAction :
                _proposalProcedure.proposalProcedure.govAction;

            if(
                (
                    govActionRef.govActionType === GovActionType.ParameterChange ||
                    govActionRef.govActionType === GovActionType.TreasuryWithdrawals
                ) &&
                govActionRef.policyHash === undefined
            )
            {
                if(
                    isIUTxO( script_or_ref ) &&
                    script_or_ref.resolved.refScript instanceof Script
                )
                {
                    govActionRef.policyHash = script_or_ref.resolved.refScript.hash;
                }
                else if( script_or_ref instanceof Script )
                {
                    govActionRef.policyHash = script_or_ref.hash;
                }
            }

            return self;
        }

        function _propose(
            proposal: IProposalProcedure,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            redeemer = canBeData( redeemer ) ? forceData( redeemer ) : undefined;
            if( shouldResolveToUTxO( script_or_ref ) )
            {
                tasks.push({
                    kind: TxBuilderTaskKind.ResolveUTxO,
                    arg: script_or_ref,
                    onResolved: ( ref ) => {
                        __propose(
                            proposal,
                            redeemer as (Data | undefined),
                            ref
                        )
                    }
                });
                
                return self;
            }
            else return __propose(
                proposal,
                redeemer as (Data | undefined),
                script_or_ref
            );
        }
        function _proposeParametersChanges(
            changes: Partial<ProtocolParameters>,
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            govActionId?: ITxOutRef | TxOutRefStr,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.ParameterChange,
                        protocolParamsUpdate: changes,
                        govActionId: govActionId ? forceTxOutRef( govActionId ) : undefined,
                        // policyHash // script hash if any specified
                    },
                },
                redeemer,
                script_or_ref
            );
        }
        function _proposeHardForkInitiation(
            nextProtocolVersion: IProtocolVerision,
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            govActionId?: ITxOutRef | TxOutRefStr,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.InitHardFork,
                        protocolVersion: nextProtocolVersion,
                        govActionId: govActionId ? forceTxOutRef( govActionId ) : undefined,
                    },
                },
                redeemer,
                script_or_ref
            );
        }
        function _proposeTreasuryWithdrawal(
            withdrawals: ITxWithdrawals | TxWithdrawals,
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.TreasuryWithdrawals,
                        withdrawals,
                        // policyHash // script hash if any specified
                    },
                },
                redeemer,
                script_or_ref
            );
        }
        function _proposeNoConfidence(
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            govActionId?: ITxOutRef | TxOutRefStr,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.NoConfidence,
                        govActionId: govActionId ? forceTxOutRef( govActionId ) : undefined,
                        // policyHash // script hash if any specified
                    },
                },
                redeemer,
                script_or_ref
            );
        }
        function _proposeComitteeUpdate(
            toRemove: Credential[],
            toAdd: INewCommitteeEntry[],
            threshold: Rational,
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            govActionId?: ITxOutRef | TxOutRefStr,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.UpdateCommittee,
                        toRemove,
                        toAdd,
                        threshold,
                        govActionId: govActionId ? forceTxOutRef( govActionId ) : undefined,
                    },
                },
                redeemer,
                script_or_ref
            );
        }
        function _proposeNewConstitution(
            constitution: IConstitution,
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            govActionId?: ITxOutRef | TxOutRefStr,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.NewConstitution,
                        constitution,
                        govActionId: govActionId ? forceTxOutRef( govActionId ) : undefined,
                    },
                },
                redeemer,
                script_or_ref
            );
        }
        function _proposeInfos(
            procedureInfos: Omit<IProposalProcedure,"govAction">,
            redeemer?: CanBeData,
            script_or_ref?: Script<PlutusScriptType> | CanResolveToUTxO
        ): TxBuilderRunner
        {
            return _propose({
                    ...procedureInfos,
                    govAction: {
                        govActionType: GovActionType.Info,
                    },
                },
                redeemer,
                script_or_ref
            );
        }

        async function _build(): Promise<Tx>
        {
            const otherTasks: TxBuilderPromiseTask[] = new Array( tasks.length );
            let oLen = 0;
            const utxoTasks: TxBuilderResolveUTxOTask[] = new Array( tasks.length );
            let uLen = 0;
            const insTasks: TxBuilderResolveTxInTask[] = new Array( tasks.length );
            let iLen = 0;

            // collect tasks first time
            for(const task of tasks)
            {
                switch( task.kind )
                {
                    case TxBuilderTaskKind.ResolveUTxO:
                        utxoTasks[ uLen++ ] = task as TxBuilderResolveUTxOTask;
                        break;
                    case TxBuilderTaskKind.ResolveTxIn:
                        insTasks[ iLen++ ] = task as TxBuilderResolveTxInTask;
                        break;
                    default:
                        otherTasks[ oLen++ ] = task;
                        break;
                }
            }
            tasks.length = 0;
            utxoTasks.length = uLen;
            insTasks.length = iLen;
            otherTasks.length = oLen;

            _setCollateralTask && utxoTasks.push( _setCollateralTask );

            async function resolveUtxos( _tasks: TxBuilderResolveUTxOTask[] | TxBuilderResolveTxInTask[] ): Promise<void>
            {
                const utxosToFind = new Array( _tasks.length ) as CanResolveToUTxO[];
                let uLen = 0;
                const resolvedUtxos = new Array( _tasks.length ) as UTxO[];
                let iLen = 0;
    
                for( const { arg } of _tasks )
                {
                    if( arg instanceof UTxO ) resolvedUtxos[ iLen++ ] = arg;
                    else if( isIUTxO( arg ) ) resolvedUtxos[ iLen++ ] = new UTxO( arg );
                    else utxosToFind[ uLen++ ] = arg;
                }
                utxosToFind.length = uLen;
                resolvedUtxos.length = iLen;
    
                if( uLen > 0 )
                {
                    if( typeof provider.resolveUtxos !== "function" )
                    {
                        throw new Error(
                            "some unresolved utxos where used and the provider is missing the 'resolveUtxos' method to resolve them"
                        );
                    }
                    resolvedUtxos.push( ...(await provider.resolveUtxos( utxosToFind )) );
                }

                const datumHashesToResolve = resolvedUtxos.filter( u => {
                    const dat = u.resolved.datum?.toString() ?? "undefined";
                    return (
                        ByteString.isValidHexValue( dat ) &&
                        dat.length === 64 && // 32 * 2
                        !_datumsHashes.includes( dat )
                    );
                })
                .map( u => u.resolved.datum as Hash32 );

                if( datumHashesToResolve.length > 0 )
                {
                    if( typeof provider.resolveDatumHashes !== "function" )
                    {
                        throw new Error("provider is missing 'resolveDatumHashes' function but some unresolved datum hashes where found")
                    }
                    const resolvedDatums = await provider.resolveDatumHashes( datumHashesToResolve );
                    for( const { hash, datum } of resolvedDatums )
                    {
                        _saveResolvedDatum( forceData( datum ), hash.toString() );
                    }
                }
    
                for( const u of resolvedUtxos )
                {
                    const resolvedIdx = _tasks.findIndex( t => forceTxOutRefStr( t.arg ) === u.utxoRef.toString() );
                    if( resolvedIdx < 0 )
                    {
                        continue; // ??? // extra utxo?
                    }
                    let task: TxBuilderResolveUTxOTask | TxBuilderResolveTxInTask
                    if( resolvedIdx === 0 )
                    {
                        task = _tasks.shift()!;
                    }
                    else
                    {
                        task = _tasks[ resolvedIdx ];
                        // remove in-place
                        void _tasks.splice( resolvedIdx, 1 );
                    }
    
                    task.onResolved( u );
                }

                // should already be 0 but just to be sure;
                _tasks.length = 0;
            }

            await resolveUtxos( utxoTasks );

            let hasUTxOTasks = utxoTasks.length > 0;
            do {
                // collect any other thasks
                for(const task of tasks)
                {
                    switch( task.kind )
                    {
                        case TxBuilderTaskKind.ResolveUTxO:
                            utxoTasks.push( task as TxBuilderResolveUTxOTask );
                            break;
                        case TxBuilderTaskKind.ResolveTxIn:
                            insTasks.push( task as TxBuilderResolveTxInTask );
                            break;
                        default:
                            otherTasks.push( task );
                            break;
                    }
                }
                // clear all tasks
                tasks.length = 0;

                hasUTxOTasks = utxoTasks.length > 0;
                hasUTxOTasks && await resolveUtxos( utxoTasks );
            } while ( hasUTxOTasks )

            insTasks.length > 0 && await resolveUtxos( insTasks );

            while( otherTasks.length > 0 )
            {
                const { kind, getPromise } = otherTasks.pop()!
                
                if(
                    ( kind === TxBuilderTaskKind.ValidFromPOSIX || kind === TxBuilderTaskKind.ValidToPOSIX ) &&
                    !isGenesisInfos( txBuilder.genesisInfos )
                )
                {
                    if( typeof provider.getGenesisInfos !== "function" )
                    {
                        throw new Error(
                            "POSIX operatoins do require either a tx builder with genesis infos or a provider that can fetch them; but none is present"
                        );
                    }
                    txBuilder.setGenesisInfos(
                        await provider.getGenesisInfos()
                    );
                }

                await getPromise();
            };

            if( !buildArgs.changeAddress )
            {
                if( typeof provider.getChangeAddress === "function" )
                {
                    buildArgs.changeAddress = await provider.getChangeAddress();
                }
                else
                {
                    if(
                        !Array.isArray( buildArgs.inputs ) ||
                        buildArgs.inputs.length === 0
                    )
                    {
                        throw new Error("can't deduce change Address; missing inputs")    
                    }
    
                    const _changeInput = buildArgs.inputs
                    ?.find( _in => {
                        const addr = ( isIUTxO( _in ) ? _in : _in.utxo ).resolved.address;
                        return (
                            addr instanceof Address ?
                            addr : Address.fromString( addr )
                        ).paymentCreds.type === CredentialType.KeyHash
                    })

                    buildArgs.changeAddress =
                    (
                        isIUTxO( _changeInput ) ?
                        _changeInput :
                        _changeInput?.utxo
                    )?.resolved.address;
    
                    if( !buildArgs.changeAddress )
                    {
                        console.log( buildArgs.outputs );
                        console.log( Array.isArray( buildArgs.outputs ) );
                        if( Array.isArray( buildArgs.outputs ) )
                        {
                            buildArgs.changeAddress = buildArgs.outputs
                            ?.find( out => forceAddr(out.address).paymentCreds.type === CredentialType.KeyHash )
                            ?.address!
                        }
                        else throw new Error("can't deduce change Address; only script inputs");

                        if( !buildArgs.changeAddress )
                        {
                            throw new Error("can't deduce change Address; only script inputs and scripts outputs");
                        }
                    }
                }
            }

            if( refUtxos.length > 0 )
            {
                if( !Array.isArray( buildArgs.readonlyRefInputs ) )
                {
                    buildArgs.readonlyRefInputs = [];
                }
                void buildArgs.readonlyRefInputs.push( ...refUtxos );
            }

            const tx = await txBuilder.build( buildArgs );
            
            self.reset();

            return tx;
        };

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
                setMetadata: {
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
                delegateTo: {
                    value: _delegateTo,
                    ...readonlyValueDescriptor
                },
                deregisterStake: {
                    value: _deregisterStake,
                    ...readonlyValueDescriptor
                },
                mintAssets: {
                    value: _mintAssets,
                    ...readonlyValueDescriptor
                },
                registerStake: {
                    value: _registerStake,
                    ...readonlyValueDescriptor
                },
                registerStakeAddress: {
                    value: _registerStake,
                    ...readonlyValueDescriptor
                },
                registerPool: {
                    value: _registerPool,
                    ...readonlyValueDescriptor
                },
                retirePool: {
                    value: _retirePool,
                    ...readonlyValueDescriptor
                },
                withdraw: {
                    value: _withdraw,
                    ...readonlyValueDescriptor
                },
                attachCertificateValidator: {
                    value: _addAviableScript,
                    ...readonlyValueDescriptor
                },
                attachMintingValidator: {
                    value: _addAviableScript,
                    ...readonlyValueDescriptor
                },
                attachSpendingValidator: {
                    value: _addAviableScript,
                    ...readonlyValueDescriptor
                },
                attachWithdrawalValidator: {
                    value: _addAviableScript,
                    ...readonlyValueDescriptor
                },
                attachValidator: {
                    value: _addAviableScript,
                    ...readonlyValueDescriptor
                },
                readFrom: {
                    value: _referenceUTxOs,
                    ...readonlyValueDescriptor
                },
                referenceUtxos: {
                    value: _referenceUTxOs,
                    ...readonlyValueDescriptor
                },
                collectFrom: {
                    value: _addInputs,
                    ...readonlyValueDescriptor
                },
                addInputs: {
                    value: _addInputs,
                    ...readonlyValueDescriptor
                },
                addInput: {
                    value: _addSingleInput,
                    ...readonlyValueDescriptor
                },
                payTo: {
                    value: _payTo,
                    ...readonlyValueDescriptor
                },
                setCollateral: {
                    value: _setCollateral,
                    ...readonlyValueDescriptor
                },
                setCollateralAmount: {
                    value: _setCollateralAmount,
                    ...readonlyValueDescriptor
                },
                vote: {
                    value: _vote,
                    ...readonlyValueDescriptor
                },
                voteDRep: {
                    value: _voteDRep,
                    ...readonlyValueDescriptor
                },
                voteScriptDRep: {
                    value: _voteScriptDRep,
                    ...readonlyValueDescriptor
                },
                voteConstitutionalComittee: {
                    value: _voteConstitutionalComittee,
                    ...readonlyValueDescriptor
                },
                voteScriptConstitutionalComittee: {
                    value: _voteScriptConstitutionalComittee,
                    ...readonlyValueDescriptor
                },
                voteStakePool: {
                    value: _voteStakePool,
                    ...readonlyValueDescriptor
                },
                propose: {
                    value: _propose,
                    ...readonlyValueDescriptor
                },
                proposeParametersChanges: {
                    value: _proposeParametersChanges,
                    ...readonlyValueDescriptor
                },
                proposeHardForkInitiation: {
                    value: _proposeHardForkInitiation,
                    ...readonlyValueDescriptor
                },
                proposeTreasuryWithdrawal: {
                    value: _proposeTreasuryWithdrawal,
                    ...readonlyValueDescriptor
                },
                proposeNoConfidence: {
                    value: _proposeNoConfidence,
                    ...readonlyValueDescriptor
                },
                proposeComitteeUpdate: {
                    value: _proposeComitteeUpdate,
                    ...readonlyValueDescriptor
                },
                proposeNewConstitution: {
                    value: _proposeNewConstitution,
                    ...readonlyValueDescriptor
                },
                proposeInfos: {
                    value: _proposeInfos,
                    ...readonlyValueDescriptor
                },
                build: {
                    value: _build,
                    ...readonlyValueDescriptor
                }
            }
        );
    }
}