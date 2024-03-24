import { Coin, defaultProtocolParameters } from "@harmoniclabs/cardano-ledger-ts";
import { CanBeUInteger, canBeUInteger } from "../utils/ints";
import { CborPositiveRational } from "@harmoniclabs/cbor";
import { ExBudget, ExBudgetJson } from "@harmoniclabs/plutus-machine";
import { Rational, cborFromRational, isRational } from "../utils/Rational";
import { CostModels, isCostModels } from "@harmoniclabs/cardano-costmodels-ts";
import { isObject } from "@harmoniclabs/obj-utils";

export interface ValidatedTxBuilderProtocolParams {
    // minimal fields for tx creation
    txFeePerByte: bigint,
    txFeeFixed: bigint,
    utxoCostPerByte: bigint,

    // optional fileds for tx validation
    maxTxSize: bigint,
    maxTxExecutionUnits: ExBudget,
    maxCollateralInputs: bigint,
    collateralPercentage: bigint,
    minfeeRefScriptCostPerByte: CborPositiveRational

    // plutus costs are optional because
    // not all tx have plutus scripts
    // if a tx has plutus scripts and
    // plutus-related params are missing the tx builder throws
    executionUnitPrices: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational,
    ]
    costModels: CostModels
}

// export type TxBuilderProtocolParams = Partial<ValidatedTxBuilderProtocolParams>
export interface TxBuilderProtocolParams {
    // minimal fields for tx creation
    txFeePerByte: CanBeUInteger,
    txFeeFixed: CanBeUInteger,
    utxoCostPerByte: Coin,

    // optional fileds for tx validation
    maxTxSize: CanBeUInteger,
    maxTxExecutionUnits: ExBudget | ExBudgetJson,
    maxCollateralInputs: CanBeUInteger,
    collateralPercentage: CanBeUInteger,
    minfeeRefScriptCostPerByte: Rational

    // plutus costs are optional because
    // not all tx have plutus scripts
    // if a tx has plutus scripts and
    // plutus-related params are missing the tx builder throws
    executionUnitPrices: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational
    ] | {
        priceMemory: number;
        priceSteps: number;
    }
    costModels: CostModels
}

export const defaultTxBuilderProtocolParameters = Object.freeze({
    txFeePerByte: BigInt( defaultProtocolParameters.txFeePerByte ),
    txFeeFixed: BigInt( defaultProtocolParameters.txFeeFixed ),
    utxoCostPerByte: BigInt( defaultProtocolParameters.utxoCostPerByte ),

    maxTxSize: BigInt( defaultProtocolParameters.maxTxSize ),
    maxTxExecutionUnits: forceExBudget( defaultProtocolParameters.maxTxExecutionUnits ),
    maxCollateralInputs: BigInt( defaultProtocolParameters.maxCollateralInputs ),
    collateralPercentage: BigInt( defaultProtocolParameters.collateralPercentage ),
    minfeeRefScriptCostPerByte: cborFromRational( defaultProtocolParameters.minfeeRefScriptCostPerByte ),

    executionUnitPrices: forceExecUnitPricesArray( defaultProtocolParameters.executionUnitPrices ),
    costModels: defaultProtocolParameters.costModels
} as ValidatedTxBuilderProtocolParams);

function forceExBudget( ex: ExBudget | ExBudgetJson ): ExBudget
{
    return ex instanceof ExBudget ? ex.clone() : ExBudget.fromJson( ex );
}

function forceExecUnitPricesArray(
    ex: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational
    ] | {
        priceMemory: number;
        priceSteps: number;
    }
): [
    mem_price: CborPositiveRational,
    step_price: CborPositiveRational
]
{
    return Array.isArray( ex ) ? ex.slice() as any : [
        CborPositiveRational.fromNumber( ex.priceMemory ),
        CborPositiveRational.fromNumber( ex.priceSteps ),
    ];
}

const keysOfTxBuilderProtocolParameters: (keyof ValidatedTxBuilderProtocolParams)[] = Object.freeze( Object.keys( defaultTxBuilderProtocolParameters ) ) as any;

export function isValidatedTxBuilderProtocolParams( stuff: any ): stuff is ValidatedTxBuilderProtocolParams
{
    if( !isObject( stuff ) ) return false;

    const keys = Object.keys( stuff );

    // all keys must be present
    if( !keysOfTxBuilderProtocolParameters.every( key => keys.includes( key ) ) )
    return false;

    const ppexecCosts = stuff.executionUnitPrices;

    if(!(
        (
            Array.isArray( ppexecCosts ) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) ||
        (
            isObject( ppexecCosts ) &&
            typeof (ppexecCosts as any).priceSteps === "number" &&
            typeof (ppexecCosts as any).priceMemory === "number"
        )
    )) return false;

    return (
        canBeUInteger( stuff.txFeePerByte ) &&
        canBeUInteger( stuff.txFeeFixed ) &&
        canBeUInteger( stuff.utxoCostPerByte ) &&
        canBeUInteger( stuff.maxTxSize ) &&
        ( stuff.maxTxExecutionUnits instanceof ExBudget || ExBudget.isJson( stuff.maxTxExecutionUnits ) ) &&
        canBeUInteger( stuff.maxCollateralInputs ) &&
        canBeUInteger( stuff.collateralPercentage ) &&
        isRational( stuff.minfeeRefScriptCostPerByte ) &&
        isCostModels( stuff.costModels )
    );
}

export function completeTxBuilderProtocolParams( partial: TxBuilderProtocolParams | undefined ): ValidatedTxBuilderProtocolParams
{
    if( partial === undefined ) return { ...defaultTxBuilderProtocolParameters };

    const result: ValidatedTxBuilderProtocolParams = {} as any;

    result.executionUnitPrices = (
        partial.executionUnitPrices ? 
            forceExecUnitPricesArray( partial.executionUnitPrices ) :
            undefined!
    );
    const ppexecCosts = result.executionUnitPrices;

    if(!(
        Array.isArray( ppexecCosts ) &&
        ppexecCosts.length >= 2 &&
        ppexecCosts[0] instanceof CborPositiveRational &&
        ppexecCosts[1] instanceof CborPositiveRational
    )) result.executionUnitPrices = defaultTxBuilderProtocolParameters.executionUnitPrices.slice() as any;

    result.txFeePerByte = (
        canBeUInteger( partial.txFeePerByte ) ?
            BigInt( partial.txFeePerByte ) :
            defaultTxBuilderProtocolParameters.txFeePerByte
    );
    result.txFeeFixed = (
        canBeUInteger( partial.txFeeFixed ) ?
            BigInt( partial.txFeeFixed ) :
            defaultTxBuilderProtocolParameters.txFeeFixed
    );
    result.utxoCostPerByte = (
        canBeUInteger( partial.utxoCostPerByte ) ?
            BigInt( partial.utxoCostPerByte ) :
            defaultTxBuilderProtocolParameters.utxoCostPerByte
    );
    result.maxTxSize = (
        canBeUInteger( partial.maxTxSize ) ?
            BigInt( partial.maxTxSize ) :
            defaultTxBuilderProtocolParameters.maxTxSize
    );
    result.maxTxExecutionUnits = (
        ( partial.maxTxExecutionUnits instanceof ExBudget || ExBudget.isJson( partial.maxTxExecutionUnits ) ) ?
            forceExBudget( partial.maxTxExecutionUnits ) :
            defaultTxBuilderProtocolParameters.maxTxExecutionUnits.clone()
    );
    result.maxCollateralInputs = (
        canBeUInteger( partial.maxCollateralInputs ) ?
            BigInt( partial.maxCollateralInputs ) :
            defaultTxBuilderProtocolParameters.maxCollateralInputs
    );
    result.collateralPercentage = (
        canBeUInteger( partial.collateralPercentage ) ?
            BigInt( partial.collateralPercentage ) :
            defaultTxBuilderProtocolParameters.collateralPercentage
    );
    result.collateralPercentage = (
        canBeUInteger( partial.collateralPercentage ) ?
            BigInt( partial.collateralPercentage ) :
            defaultTxBuilderProtocolParameters.collateralPercentage
    );
    result.minfeeRefScriptCostPerByte = (
        isRational( partial.minfeeRefScriptCostPerByte ) ?
            cborFromRational( partial.minfeeRefScriptCostPerByte ) :
            defaultTxBuilderProtocolParameters.minfeeRefScriptCostPerByte
    );
    result.costModels = (
        isCostModels( partial.costModels ) ?
            partial.costModels :
            defaultTxBuilderProtocolParameters.costModels
    );

    return result;
}