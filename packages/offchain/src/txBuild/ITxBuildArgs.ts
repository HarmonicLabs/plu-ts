import { Address, AddressStr, CanBeHash28, Hash32, IProposalProcedure, IUTxO, IVotingProcedures, IVotingProceduresEntry, PubKeyHash, Script, TxMetadata, TxOut, UTxO, VotingProcedures, isIProposalProcedure, isIUTxO, isIVotingProceduresEntry } from "@harmoniclabs/cardano-ledger-ts";
import { NormalizedITxBuildCert, type ITxBuildCert, normalizeITxBuildCert } from "./ITxBuildCert";
import { NormalizedITxBuildInput, type ITxBuildInput, normalizeITxBuildInput } from "./ITxBuildInput/ITxBuildInput";
import { NormalizedITxBuildMint, type ITxBuildMint, normalizeITxBuildMint } from "./ITxBuildMint";
import { txBuildOutToTxOut, type ITxBuildOutput } from "./ITxBuildOutput";
import { NormalizedITxBuildWithdrawal, type ITxBuildWithdrawal, normalizeITxBuildWithdrawal } from "./ITxBuildWithdrawal";
import { CanBeUInteger } from "../utils/ints";
import { ChangeInfos, NormalizedChangeInfos, normalizeChangeInfos } from "./ChangeInfos/ChangeInfos";
import { ITxBuildVotingProcedure, NormalizedITxBuildVotingProcedure, normalizeITxBuildVotingProcedure } from "./ITxBuildVotingProcedure";
import { ITxBuildProposalProcedure, NormalizedITxBuildProposalProcedure, normalizeITxBuildProposalProcedure } from "./ITxBuildProposalProcedure";

export interface ITxBuildArgs {
    inputs: (ITxBuildInput | IUTxO)[],
    /**
     * same as `changeAddress` but allows to specify datums and ref scripts
     * @example
     * ```ts
     * txBuilder.build({
     *     change: { address: "your_address" }
     * });
     * ```
     */
    changeAddress?: Address | AddressStr,
    change?: ChangeInfos;
    outputs?: ITxBuildOutput[],
    readonlyRefInputs?: IUTxO[],
    requiredSigners?: CanBeHash28[], // PubKeyHash[],
    collaterals?: IUTxO[],
    collateralReturn?: ITxBuildOutput,
    mints?: ITxBuildMint[],
    invalidBefore?: CanBeUInteger,
    invalidAfter?: CanBeUInteger,
    certificates?: ITxBuildCert[],
    withdrawals?: ITxBuildWithdrawal[],
    /**
     * # metadata message following cip20
     * 
     * overwrites the metadata at label 674 if already present. 
     **/
    memo?: string,
    metadata?: TxMetadata,
    // conway
    votingProcedures?: (IVotingProceduresEntry | ITxBuildVotingProcedure)[],
    proposalProcedures?: (IProposalProcedure | ITxBuildProposalProcedure)[],
    currentTreasuryValue?: CanBeUInteger,
    paymentToTreasury?: CanBeUInteger
}

export interface NormalizedITxBuildArgs extends ITxBuildArgs {
    inputs: NormalizedITxBuildInput[],
    changeAddress?: Address,
    change?: NormalizedChangeInfos;
    outputs?: TxOut[],
    // era?: Era // latest
    readonlyRefInputs?: UTxO[],
    requiredSigners?: PubKeyHash[],
    collaterals?: UTxO[],
    collateralReturn?: TxOut,
    mints?: NormalizedITxBuildMint[],
    invalidBefore?: CanBeUInteger,
    invalidAfter?: CanBeUInteger,
    certificates?: NormalizedITxBuildCert[],
    withdrawals?: NormalizedITxBuildWithdrawal[],
    /**
     * # metadata message following cip20
     * 
     * overwrites the metadata at label 674 if already present. 
     **/
    memo?: string,
    metadata?: TxMetadata,
    // conway
    votingProcedures?: NormalizedITxBuildVotingProcedure[],
    proposalProcedures?: NormalizedITxBuildProposalProcedure[],
    currentTreasuryValue?: bigint,
    paymentToTreasury?: bigint
}

export function normalizeITxBuildArgs({
    inputs,
    change,
    changeAddress,
    outputs,
    readonlyRefInputs,
    requiredSigners,
    collaterals,
    collateralReturn,
    mints,
    invalidBefore,
    invalidAfter,
    certificates,
    withdrawals,
    memo,
    metadata,
    votingProcedures,
    proposalProcedures,
    currentTreasuryValue,
    paymentToTreasury
}: ITxBuildArgs ): NormalizedITxBuildArgs
{
    return {
        inputs: inputs.map( normalizeITxBuildArgsInputs ),
        change: change ? normalizeChangeInfos( change ) : undefined,
        changeAddress: changeAddress ? (
            typeof changeAddress === "string" ?
                Address.fromString( changeAddress ):
                changeAddress
        ) : undefined,
        outputs: outputs?.map( txBuildOutToTxOut ),
        readonlyRefInputs: readonlyRefInputs?.map( toUTxONoClone ),
        requiredSigners: requiredSigners?.map( toPubKeyHash ),
        collaterals: collaterals?.map( toUTxONoClone ),
        collateralReturn: collateralReturn ? txBuildOutToTxOut( collateralReturn ) : undefined,
        mints: mints?.map( normalizeITxBuildMint ),
        invalidBefore: invalidBefore === undefined ? undefined : BigInt( invalidBefore ),
        invalidAfter: invalidAfter === undefined ? undefined : BigInt( invalidAfter ),
        certificates: certificates?.map( normalizeITxBuildCert ),
        withdrawals: withdrawals?.map( normalizeITxBuildWithdrawal ),
        memo: memo ? String( memo ) : undefined,
        metadata,
        votingProcedures:
            Array.isArray( votingProcedures ) ?
                votingProcedures.map( entry => {
                    if( isIVotingProceduresEntry( entry ) )
                    entry = {
                        votingProcedure: entry,
                        script: undefined // for js shape optimization
                    };
                    return normalizeITxBuildVotingProcedure( entry );
                }) : undefined,
        proposalProcedures:
            Array.isArray( proposalProcedures ) ?
                proposalProcedures.map(entry => {
                    if( isIProposalProcedure( entry ) )
                    entry = {
                        proposalProcedure: entry,
                        script: undefined
                    }
                    return normalizeITxBuildProposalProcedure( entry );
                }) : undefined,
        currentTreasuryValue: currentTreasuryValue === undefined ? undefined : BigInt( currentTreasuryValue ),
        paymentToTreasury: paymentToTreasury === undefined ? undefined : BigInt( paymentToTreasury ),
    };
}

function normalizeITxBuildArgsInputs( input: ITxBuildInput | IUTxO ): NormalizedITxBuildInput
{
    if( isIUTxO( input ) ) return { utxo: new UTxO( input ) };
    return normalizeITxBuildInput( input );
}

function toUTxONoClone( utxo: IUTxO ): UTxO
{
    return utxo instanceof UTxO ? utxo : new UTxO( utxo );
}

function toPubKeyHash( hash: CanBeHash28 ): PubKeyHash
{
    return new PubKeyHash( hash );
}

/** @deprecated use `normalizeITxBuildArgs` instead */
export function cloneITxBuildArgs( args: ITxBuildArgs ): ITxBuildArgs
{
    return normalizeITxBuildArgs( args );
}