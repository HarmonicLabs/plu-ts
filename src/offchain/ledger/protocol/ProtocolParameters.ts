import ObjectUtils from "../../../utils/ObjectUtils";

import { CborObj } from "../../../cbor/CborObj";
import { CborArray } from "../../../cbor/CborObj/CborArray";
import { CborMap, CborMapEntry } from "../../../cbor/CborObj/CborMap";
import { CborUInt } from "../../../cbor/CborObj/CborUInt";
import { CborPositiveRational } from "../../../cbor/extra/CborRational";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { ExBudget, ExBudgetJson } from "../../../onchain/CEK/Machine/ExBudget";
import { canBeUInteger, CanBeUInteger, forceBigUInt } from "../../../types/ints/Integer";
import { CostModels, costModelsFromCborObj, costModelsToCborObj, costModelsToJson, defaultV1Costs, defaultV2Costs, isCostModels } from "../CostModels";
import type { Epoch } from "../Epoch";
import type { Coin } from "../Coin";
import { UnTerm } from "../../../onchain";

export interface ProtocolParamters {
    txFeePerByte: CanBeUInteger,
    txFeeFixed: CanBeUInteger,
    maxBlockBodySize: CanBeUInteger,
    maxTxSize: CanBeUInteger,
    maxBlockHeaderSize: CanBeUInteger,
    stakeAddressDeposit: Coin,
    stakePoolDeposit: Coin,
    poolRetireMaxEpoch: Epoch,
    stakePoolTargetNum: CanBeUInteger,
    poolPledgeInfluence: CborPositiveRational | number,
    monetaryExpansion: CborPositiveRational | number,
    treasuryCut: CborPositiveRational | number,
    protocolVersion: [ CanBeUInteger, CanBeUInteger ] | { major: number, minor: number },
    minPoolCost: Coin,
    utxoCostPerByte: Coin,
    costModels: CostModels,
    executionUnitPrices: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational,
    ] | {
        priceMemory: number,
        priceSteps: number
    }
    maxTxExecutionUnits: ExBudget | ExBudgetJson,
    maxBlockExecutionUnits: ExBudget | ExBudgetJson,
    maxValueSize: CanBeUInteger,
    collateralPercentage: CanBeUInteger,
    maxCollateralInputs: CanBeUInteger
}

export function isProtocolParameters( something: any ): something is ProtocolParamters
{
    const expectedKeys = [
        "txFeePerByte",
        "txFeeFixed",
        "maxBlockBodySize",
        "maxTxSize",
        "maxBlockHeaderSize",
        "stakeAddressDeposit",
        "stakePoolDeposit",
        "poolRetireMaxEpoch",
        "stakePoolTargetNum",
        "poolPledgeInfluence",
        "monetaryExpansion",
        "treasuryCut",
        "protocolVersion",
        "minPoolCost",
        "utxoCostPerByte",
        "costModels",
        "executionUnitPrices",
        "maxTxExecutionUnits",
        "maxBlockExecutionUnits",
        "maxValueSize",
        "collateralPercentage",
        "maxCollateralInputs"
    ] as const;

    const actualKeys = Object.keys( something )

    if(
        !expectedKeys.every( k => actualKeys.includes( k ) )
    ) return false;

    const pp: ProtocolParamters = something;

    if(!
        ([
            "txFeePerByte",
            "txFeeFixed",
            "maxBlockBodySize",
            "maxTxSize",
            "maxBlockHeaderSize",
            "stakeAddressDeposit",
            "stakePoolDeposit",
            "poolRetireMaxEpoch",
            "stakePoolTargetNum",
            "minPoolCost",
            "utxoCostPerByte",
            "maxValueSize",
            "collateralPercentage",
            "maxCollateralInputs"
        ] as const).every( uintKey => canBeUInteger( pp[uintKey] ) )
    ) return false;

    if(!(
        typeof pp.poolPledgeInfluence === "number" || pp.poolPledgeInfluence instanceof CborPositiveRational &&
        typeof pp.monetaryExpansion === "number" || pp.monetaryExpansion instanceof CborPositiveRational &&
        typeof pp.treasuryCut === "number" || pp.treasuryCut instanceof CborPositiveRational
    )) return false

    const ppv = pp.protocolVersion;

    if(!(
        (
            Array.isArray( ppv ) &&
            ppv.length >= 2 &&
            canBeUInteger( ppv[0] ) && canBeUInteger( ppv[1] )
        ) || (
            ObjectUtils.isObject( ppv ) &&
            canBeUInteger( (ppv as any).major ) &&
            canBeUInteger( (ppv as any).minor )
        )
    )) return false;

    const ppexecCosts = pp.executionUnitPrices;

    if(!(
        (
            Array.isArray( ppexecCosts ) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) ||
        (
            ObjectUtils.isObject( ppexecCosts ) &&
            typeof (ppexecCosts as any).priceSteps === "number" &&
            typeof (ppexecCosts as any).priceMemory === "number"
        )
    )) return false;

    if(!(
        pp.maxTxExecutionUnits instanceof ExBudget      || ExBudget.isJson(pp.maxTxExecutionUnits) &&
        pp.maxBlockExecutionUnits instanceof ExBudget   || ExBudget.isJson(pp.maxBlockExecutionUnits)
    )) return false

    if(!(
        isCostModels( pp.costModels )
    )) return false;

    return true;
}

function maybeValidCborPosRat( _: any ): boolean
{
    return (_ === undefined || _ instanceof CborPositiveRational || typeof _ === "number" );
}

export function isPartialProtocolParameters( something: object ): something is Partial<ProtocolParamters>
{
    if( !ObjectUtils.isObject( something ) ) return false;

    const pp: Partial<ProtocolParamters> = something;

    if(!
        ([
            "txFeePerByte",
            "txFeeFixed",
            "maxBlockBodySize",
            "maxTxSize",
            "maxBlockHeaderSize",
            "stakeAddressDeposit",
            "stakePoolDeposit",
            "poolRetireMaxEpoch",
            "stakePoolTargetNum",
            "minPoolCost",
            "utxoCostPerByte",
            "maxValueSize",
            "collateralPercentage",
            "maxCollateralInputs"
        ] as const).every( uintKey => pp[uintKey] === undefined || canBeUInteger( pp[uintKey] ) )
    ) return false;


    if(!(
        maybeValidCborPosRat( pp.poolPledgeInfluence ) &&
        maybeValidCborPosRat( pp.monetaryExpansion ) &&
        maybeValidCborPosRat( pp.treasuryCut )
    )) return false;

    const ppv = pp.protocolVersion;

    if(!(
        ppv === undefined ||
        (
            Array.isArray( ppv ) &&
            ppv.length >= 2 &&
            canBeUInteger( ppv[0] ) && canBeUInteger( ppv[1] )
        ) || 
        (
            ObjectUtils.isObject( ppv ) &&
            typeof (ppv as any).major === "number" &&
            typeof (ppv as any).minor === "number"
        )
    )) return false;

    const ppexecCosts = pp.executionUnitPrices;

    if(!(
        ppexecCosts === undefined ||
        (
            Array.isArray( ppexecCosts ) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        ) || (
            ObjectUtils.isObject( ppexecCosts ) &&
            typeof (ppexecCosts as any).priceMemory === "number" &&
            typeof (ppexecCosts as any).priceSteps  === "number"
        )
    )) return false;

    if(!(
        (
            pp.maxTxExecutionUnits === undefined        ||
            pp.maxTxExecutionUnits instanceof ExBudget  ||
            ExBudget.isJson( pp.maxTxExecutionUnits )
        ) &&
        (
            pp.maxBlockExecutionUnits === undefined         ||
            pp.maxBlockExecutionUnits instanceof ExBudget   ||
            ExBudget.isJson( pp.maxBlockExecutionUnits )
        )
    )) return false

    if(!(
        pp.costModels === undefined || isCostModels( pp.costModels )
    )) return false;

    return true;
}

function mapUIntEntryOrUndefined( tag: number, a: CanBeUInteger | undefined ): { k: CborUInt, v: CborUInt } | undefined
{
    return a === undefined ? undefined : {
        k: new CborUInt( tag ),
        v: new CborUInt( forceBigUInt( a ) )
    };
}

function fromUIntOrUndef( n: CborObj | undefined ): bigint | undefined
{
    return n instanceof CborUInt ? n.num : undefined;
}

function kv( k: number, v: CborObj | undefined ): CborMapEntry | undefined
{
    
    return v === undefined ? undefined : {
        k: new CborUInt( k ),
        v
    };
}

export function partialProtocolParametersToCborObj( pps: Partial<ProtocolParamters> ): CborMap
{
    const {
        protocolVersion,
        executionUnitPrices,
        maxTxExecutionUnits,
        maxBlockExecutionUnits,
        costModels
    } = pps;

    const costModelsKeys = Object.keys( costModels ?? {} );

    return new CborMap([
        mapUIntEntryOrUndefined( 0, pps.txFeePerByte ),
        mapUIntEntryOrUndefined( 1, pps.txFeeFixed ),
        mapUIntEntryOrUndefined( 2, pps.maxBlockBodySize ),
        mapUIntEntryOrUndefined( 3, pps.maxTxSize ),
        mapUIntEntryOrUndefined( 4, pps.maxBlockHeaderSize ),
        mapUIntEntryOrUndefined( 5, pps.stakeAddressDeposit ),
        mapUIntEntryOrUndefined( 6, pps.stakePoolDeposit ),
        mapUIntEntryOrUndefined( 7, pps.poolRetireMaxEpoch ),
        mapUIntEntryOrUndefined( 8, pps.stakePoolTargetNum ),
        kv( 9 , typeof pps.poolPledgeInfluence === "number" ? CborPositiveRational.fromNumber( pps.poolPledgeInfluence ) : pps.poolPledgeInfluence ),
        kv( 10, typeof pps.monetaryExpansion === "number" ? CborPositiveRational.fromNumber( pps.monetaryExpansion ) : pps.monetaryExpansion ),
        kv( 11, typeof pps.treasuryCut === "number" ? CborPositiveRational.fromNumber( pps.treasuryCut ) : pps.treasuryCut ),
        protocolVersion === undefined ? undefined:
        {
            k: new CborUInt( 14 ),
            v: new CborArray([
                new CborUInt( forceBigUInt( Array.isArray(protocolVersion) ? protocolVersion[0] : protocolVersion.major ) ),
                new CborUInt( forceBigUInt( Array.isArray(protocolVersion) ? protocolVersion[1] : protocolVersion.minor ) )
            ])
        },
        mapUIntEntryOrUndefined( 16, pps.minPoolCost ),
        mapUIntEntryOrUndefined( 17, pps.utxoCostPerByte ),
        kv( 18, 
            (costModels === undefined || 
            (!costModelsKeys.includes("PlutusV1") && !costModelsKeys.includes("PlutusV2"))) ?
                undefined :
                costModelsToCborObj( costModels )
        ),
        executionUnitPrices === undefined ? undefined:
        {
            k: new CborUInt( 19 ),
            v: Array.isArray(executionUnitPrices) ? 
                new CborArray(executionUnitPrices) :
                new CborArray([
                    CborPositiveRational.fromNumber( executionUnitPrices.priceSteps ),
                    CborPositiveRational.fromNumber( executionUnitPrices.priceMemory ),
                ])
        },
        kv( 20, ExBudget.isJson( maxTxExecutionUnits    ) ? ExBudget.fromJson( maxTxExecutionUnits    ).toCborObj() : maxTxExecutionUnits?.toCborObj()      ),
        kv( 21, ExBudget.isJson( maxBlockExecutionUnits ) ? ExBudget.fromJson( maxBlockExecutionUnits ).toCborObj() : maxBlockExecutionUnits?.toCborObj()   ),
        mapUIntEntryOrUndefined( 22, pps.maxValueSize ),
        mapUIntEntryOrUndefined( 23, pps.collateralPercentage ),
        mapUIntEntryOrUndefined( 24, pps.maxCollateralInputs ),
    ].filter( elem => elem !== undefined ) as CborMapEntry[])
}

export function partialProtocolParametersFromCborObj( cObj: CborObj ): Partial<ProtocolParamters>
{
    if(!( cObj instanceof CborMap ))
    throw new InvalidCborFormatError("Partial<ProtocolParamters>")

    let fields: (CborObj | undefined)[] = new Array( 25 ).fill( undefined );

    for( let i = 0; i < 25; i++)
    {
        const { v } = (cObj as CborMap).map.find(
            ({ k }) => k instanceof CborUInt && Number( k.num ) === i
        ) ?? { v: undefined };

        if( v === undefined ) continue;

        fields[i] = v;
    }

    const [
        _minFeeCoeff,
        _minFeeFix,
        _maxBlockBodySize,
        _maxTxSize,
        _maxBlockHeaderSize,
        _keyDep,
        _poolDep,
        _epoch,
        _kParam,
        _pledgeInfluence,
        _expansionRate,
        _treasureryGrowthRate,
        _12,
        _13,
        _protocolVersion,
        _15,
        _poolMinFee,
        _adaPerUtxoByte,
        _costmdls,
        _execCosts,
        _maxTxExecUnits,
        _maxBlockExecUnits,
        _maxValueSize,
        _collatearalPerc,
        _maxCollIns
    ] = fields;

    const protocolVersion: [bigint, bigint] | undefined = (
        _protocolVersion instanceof CborArray &&
        _protocolVersion.array[0] instanceof CborUInt &&
        _protocolVersion.array[1] instanceof CborUInt
    ) ? 
    [ _protocolVersion.array[0].num, _protocolVersion.array[1].num ]
    : undefined;

    let executionUnitPrices: [CborPositiveRational, CborPositiveRational] | undefined = undefined;
    if( _execCosts instanceof CborArray )
    {
        const mem_price = CborPositiveRational.fromCborObjOrUndef( _execCosts.array[0] )
        const cpu_price = CborPositiveRational.fromCborObjOrUndef( _execCosts.array[1] )
        executionUnitPrices = mem_price !== undefined && cpu_price !== undefined ? [ mem_price, cpu_price ] : undefined;
    }

    const _costModels = costModelsFromCborObj( _costmdls );

    return {
        txFeePerByte:      fromUIntOrUndef( _minFeeCoeff ),
        txFeeFixed:            fromUIntOrUndef( _minFeeFix ),
        maxBlockBodySize:       fromUIntOrUndef( _maxBlockBodySize ),
        maxTxSize:              fromUIntOrUndef( _maxTxSize ),
        maxBlockHeaderSize:     fromUIntOrUndef( _maxBlockHeaderSize ),
        stakeAddressDeposit:             fromUIntOrUndef( _keyDep ),
        stakePoolDeposit:            fromUIntOrUndef( _poolDep ),
        poolRetireMaxEpoch:                  fromUIntOrUndef( _epoch ),
        stakePoolTargetNum:                 fromUIntOrUndef( _kParam ),
        poolPledgeInfluence:        CborPositiveRational.fromCborObjOrUndef( _pledgeInfluence ),
        monetaryExpansion:          CborPositiveRational.fromCborObjOrUndef( _expansionRate ),
        treasuryCut:   CborPositiveRational.fromCborObjOrUndef( _treasureryGrowthRate ),
        protocolVersion,
        minPoolCost:             fromUIntOrUndef( _poolMinFee ),
        utxoCostPerByte:         fromUIntOrUndef( _adaPerUtxoByte ),
        costModels:             Object.keys( _costModels ).length === 0 ? undefined : _costModels,
        executionUnitPrices,
        maxTxExecutionUnits:     _maxTxExecUnits === undefined ? undefined : ExBudget.fromCborObj( _maxTxExecUnits ),
        maxBlockExecutionUnits:  _maxBlockExecUnits === undefined ? undefined : ExBudget.fromCborObj( _maxBlockExecUnits ),
        maxValueSize:          fromUIntOrUndef( _maxValueSize ),
        collateralPercentage:   fromUIntOrUndef( _collatearalPerc ),
        maxCollateralInputs:       fromUIntOrUndef( _maxCollIns ),
    }
}

export const defaultProtocolParameters: ProtocolParamters = ObjectUtils.freezeAll({
    txFeePerByte: 44,
    txFeeFixed: 155381,
    maxBlockBodySize: 73728,
    maxTxSize: 16384,
    maxBlockHeaderSize: 1100,
    stakeAddressDeposit:  2_000_000,
    stakePoolDeposit: 500_000_000,
    poolRetireMaxEpoch: 18,
    stakePoolTargetNum: 500,
    poolPledgeInfluence: new CborPositiveRational( 3, 10 ),
    monetaryExpansion: new CborPositiveRational( 3, 1000 ),
    treasuryCut: new CborPositiveRational( 2, 10 ),
    protocolVersion: [ 8, 0 ],
    minPoolCost: 340_000_000,
    utxoCostPerByte: 34482,
    costModels: {
        PlutusScriptV1: defaultV1Costs,
        PlutusScriptV2: defaultV2Costs
    },
    executionUnitPrices: [
        new CborPositiveRational( 577, 1e2 ), // mem
        new CborPositiveRational( 721, 1e5 )  // cpu
    ],
    maxTxExecutionUnits: new ExBudget({ mem: 12_500_000, cpu: 10_000_000_000 }),
    maxBlockExecutionUnits: new ExBudget({ mem: 50_000_000, cpu: 40_000_000_000 }),
    maxValueSize: 5000,
    collateralPercentage: 150,
    maxCollateralInputs: 3
})

function cborRationalToNum( rat: CborPositiveRational | undefined ): number | undefined
{
    return rat?.toNumber()
}

export function partialProtocolParamsToJson( pp: Partial<ProtocolParamters> )
{
    return {
        ...pp,
        poolPledgeInfluence:    typeof pp.poolPledgeInfluence === "number" ? pp.poolPledgeInfluence : pp.poolPledgeInfluence?.toNumber() ,
        monetaryExpansion:      typeof pp.monetaryExpansion === "number" ? pp.monetaryExpansion : pp.monetaryExpansion?.toNumber() ,
        treasuryCut:            typeof pp.treasuryCut === "number" ? pp.treasuryCut : pp.treasuryCut?.toNumber() ,
        costModels: pp.costModels === undefined ? undefined : costModelsToJson( pp.costModels ),
        executionUnitPrices: Array.isArray(pp.executionUnitPrices) ?
            {
                priceSteps:  pp.executionUnitPrices[1].toNumber(),
                priceMemory: pp.executionUnitPrices[0].toNumber()
            } :
            pp.executionUnitPrices,
        maxTxExecutionUnits:    ExBudget.isJson( pp.maxTxExecutionUnits ) ?    pp.maxTxExecutionUnits    : pp.maxTxExecutionUnits?.toJson(),
        maxBlockExecutionUnits: ExBudget.isJson( pp.maxBlockExecutionUnits ) ? pp.maxBlockExecutionUnits : pp.maxBlockExecutionUnits?.toJson(),
    }
}