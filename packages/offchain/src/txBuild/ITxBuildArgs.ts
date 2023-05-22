import { Address, AddressStr, ProtocolUpdateProposal, PubKeyHash, TxMetadata, UTxO, protocolUpdateProposalFromCborObj, protocolUpdateProposalToCborObj } from "@harmoniclabs/cardano-ledger-ts";
import { cloneITxBuildCert, type ITxBuildCert } from "./ITxBuildCert";
import { cloneITxBuildInput, type ITxBuildInput } from "./ITxBuildInput";
import { cloneITxBuildMint, type ITxBuildMint } from "./ITxBuildMint";
import { cloneITxBuildOutput, type ITxBuildOutput } from "./ITxBuildOutput";
import { cloneITxBuildWithdrawal, type ITxBuildWithdrawal } from "./ITxBuildWithdrawal";
import { CanBeUInteger, forceBigUInt } from "../utils/ints";

export interface ITxBuildArgs {
    inputs: ITxBuildInput[],
    changeAddress: Address | AddressStr,
    outputs?: ITxBuildOutput[],
    // era?: Era // latest
    readonlyRefInputs?: UTxO[],
    requiredSigners?: PubKeyHash[],
    collaterals?: UTxO[],
    collateralReturn?: ITxBuildOutput,
    mints?: ITxBuildMint[],
    invalidBefore?: CanBeUInteger,
    invalidAfter?: CanBeUInteger,
    certificates?: ITxBuildCert[],
    withdrawals?: ITxBuildWithdrawal[],
    metadata?: TxMetadata,
    protocolUpdateProposal?: ProtocolUpdateProposal
}

export function cloneITxBuildArgs( args: Partial<ITxBuildArgs> ): ITxBuildArgs
{
    return {
        inputs: args?.inputs?.map( cloneITxBuildInput ) as ITxBuildInput[],
        changeAddress: args.changeAddress === undefined ? undefined as any as Address :
            args.changeAddress instanceof Address ? args.changeAddress.clone() :
            Address.fromString( args.changeAddress.toString() ),
        outputs: args.outputs?.map( cloneITxBuildOutput ),
        // era: Era // latest
        readonlyRefInputs: args.readonlyRefInputs?.map( u => u.clone() ),
        requiredSigners: args.requiredSigners?.map( sig => sig.clone() ),
        collaterals: args.collaterals?.map( u => u.clone() ),
        collateralReturn: args.collateralReturn ? cloneITxBuildOutput( args.collateralReturn ) : undefined,
        mints: args.mints?.map( cloneITxBuildMint ),
        invalidBefore: args.invalidBefore,
        invalidAfter: args.invalidAfter,
        certificates: args.certificates?.map( cloneITxBuildCert ),
        withdrawals: args.withdrawals?.map( cloneITxBuildWithdrawal ),
        metadata: args.metadata ? TxMetadata.fromCborObj( args.metadata.toCborObj() ) : undefined,
        protocolUpdateProposal: args.protocolUpdateProposal === undefined ? undefined :
            protocolUpdateProposalFromCborObj(
                protocolUpdateProposalToCborObj(
                    args.protocolUpdateProposal
                )
            )
    }
}