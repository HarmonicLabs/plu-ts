
export interface LucidProtocolParameters {
    minFeeA: number;
    minFeeB: number;
    maxTxSize: number;
    maxValSize: number;
    keyDeposit: bigint;
    poolDeposit: bigint;
    priceMem: number;
    priceStep: number;
    maxTxExMem: bigint;
    maxTxExSteps: bigint;
    coinsPerUtxoByte: bigint;
    collateralPercentage: number;
    maxCollateralInputs: number;
    costModels: LucidCostModels;
}

export type LucidCostModel = Record<string,number>;

export interface LucidCostModels {
    PlutusV1?: LucidCostModel
    PlutusV2?: LucidCostModel
}