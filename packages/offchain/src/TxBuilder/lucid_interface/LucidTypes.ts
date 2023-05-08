/** people seriously works with a bunch of strings ??? */

/** Bech32 */
export type LucidAddress = string;
/** Bech32 */
export type LucidRewardAddress = string;
/** Hex */
export type LucidPaymentKeyHash = string;
/** Hex */
export type LucidStakeKeyHash = string;
/** Hex */
export type LucidKeyHash = string | LucidPaymentKeyHash | LucidStakeKeyHash;
/** Hex */
export type LucidVrfKeyHash = string;
/** Hex */
export type LucidScriptHash = string;
/** Hex */
export type LucidTxHash = string;
/** Bech32 */
export type LucidPoolId = string;
/** Hex */
export type LucidDatum = string;

/**
 * **hash** adds the datum hash to the output.
 *
 * **asHash** hashes the datum and adds the datum hash to the output and the datum to the witness set.
 *
 * **inline** adds the datum to the output.
 *
 * **scriptRef** will add any script to the output.
 *
 * You can either specify **hash**, **asHash** or **inline**, only one option is allowed.
 */
export type LucidOutputData = {
    hash?: LucidDatumHash;
    asHash?: LucidDatum;
    inline?: LucidDatum;
    scriptRef?: LucidScript;
};
/** Hex */
export type LucidDatumHash = string;
/** Hex (Redeemer is only PlutusData, same as Datum) */
export type LucidRedeemer = string; // Plutus Data (same as Datum)
export type LucidLovelace = bigint;
export type Label = number;
/** Hex */
export type LucidTransactionWitnesses = string;
/** Hex */
export type LucidTransaction = string;
/** Bech32 */
export type LucidPrivateKey = string;
/** Bech32 */
export type LucidPublicKey = string;
/** Hex */
export type LucidScriptRef = string;
/** Hex */
export type LucidPayload = string;

export interface LucidCredential {
    type: "Key" | "Script";
    hash: string; // LucidKeyHash | LucidScriptHash;
}


/** Concatenation of policy id and asset name in Hex. */
export type LucidUnit = string;
export type LucidAssets = Record<LucidUnit | "lovelace", bigint>;
export type LucidScriptType = "Native" | LucidPlutusVersion;
export type LucidPlutusVersion = "PlutusV1" | "PlutusV2";

/** Hex */
export type LucidPolicyId = string;

export type LucidScript = { type: LucidScriptType; script: string };

export type LucidValidator =
  | LucidMintingPolicy
  | LucidSpendingValidator
  | LucidCertificateValidator
  | LucidWithdrawalValidator;

export type LucidMintingPolicy = LucidScript;
export type LucidSpendingValidator = LucidScript;
export type LucidCertificateValidator = LucidScript;
export type LucidWithdrawalValidator = LucidScript;

export interface LucidUTxO {
    txHash: LucidTxHash;
    outputIndex: number;
    assets: LucidAssets;
    address: LucidAddress;
    datumHash?: LucidDatumHash | null;
    datum?: LucidDatum | null;
    scriptRef?: LucidScript | null;
};

export type LucidOutRef = { txHash: LucidTxHash; outputIndex: number };

export type LucidAddressType = "Base" | "Enterprise" | "Pointer" | "Reward";

export type LucidNetwork = "Mainnet" | "Preview" | "Preprod" | "Custom";

export type LucidAddressDetails = {
  type: LucidAddressType;
  networkId: number;
  address: { bech32: LucidAddress; hex: string };
  paymentCredential?: LucidCredential;
  stakeCredential?: LucidCredential;
};

export type LucidDelegation = {
  poolId: LucidPoolId | null;
  rewards: LucidLovelace;
};

/**
 * A wallet that can be constructed from external data e.g utxos and an address.
 * It doesn't allow you to sign transactions/messages. This needs to be handled separately.
 */
export interface LucidExternalWallet {
  address: LucidAddress;
  utxos?: LucidUTxO[];
  rewardAddress?: LucidRewardAddress;
}

export type LucidSignedMessage = { signature: string; key: string };
