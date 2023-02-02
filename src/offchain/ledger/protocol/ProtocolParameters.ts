import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborMap, { CborMapEntry } from "../../../cbor/CborObj/CborMap";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborPositiveRational from "../../../cbor/extra/CborRational";
import InvalidCborFormatError from "../../../errors/InvalidCborFormatError";
import ExBudget from "../../../onchain/CEK/Machine/ExBudget";
import { ppairData } from "../../../onchain/pluts";
import { canBeUInteger, CanBeUInteger, forceUInteger } from "../../../types/ints/Integer";
import ObjectUtils from "../../../utils/ObjectUtils";
import type Coin from "../Coin";
import CostModels, { costModelsFromCborObj, costModelsToCborObj, costModelsToJson, costModelsToLanguageViewCbor, defaultV1Costs, defaultV2Costs, isCostModels } from "../CostModels";
import type Epoch from "../Epoch";

export interface ProtocolParamters {
    minFeeCoefficient: CanBeUInteger,
    minFeeFixed: CanBeUInteger,
    maxBlockBodySize: CanBeUInteger,
    maxTxSize: CanBeUInteger,
    maxBlockHeaderSize: CanBeUInteger,
    keyDeposit: Coin,
    poolDeposit: Coin,
    epoch: Epoch,
    kParam: CanBeUInteger,
    pledgeInfluence: CborPositiveRational,
    expansionRate: CborPositiveRational,
    treasureryGrowthRate: CborPositiveRational,
    protocolVersion: [ CanBeUInteger, CanBeUInteger ],
    poolMinFee: Coin,
    adaPerUtxoByte: Coin,
    costModels: CostModels,
    execCosts: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational,
    ]
    maxTxExecUnits: ExBudget,
    maxBlockExecUnits: ExBudget,
    maxValuesSize: CanBeUInteger,
    collateralPercentage: CanBeUInteger,
    maxCollateralIns: CanBeUInteger
}

export default ProtocolParamters;

export function isProtocolParameters( something: any ): something is ProtocolParamters
{
    const expectedKeys = [
        "minFeeCoefficient",
        "minFeeFixed",
        "maxBlockBodySize",
        "maxTxSize",
        "maxBlockHeaderSize",
        "keyDeposit",
        "poolDeposit",
        "epoch",
        "kParam",
        "pledgeInfluence",
        "expansionRate",
        "treasureryGrowthRate",
        "protocolVersion",
        "poolMinFee",
        "adaPerUtxoByte",
        "costModels",
        "execCosts",
        "maxTxExecUnits",
        "maxBlockExecUnits",
        "maxValuesSize",
        "collateralPercentage",
        "maxCollateralIns"
    ] as const;

    if(
        !ObjectUtils.has_n_determined_keys(
            something,
            expectedKeys.length,
            ...expectedKeys
        )
    ) return false;

    const pp: ProtocolParamters = something;

    if(!
        ([
            "minFeeCoefficient",
            "minFeeFixed",
            "maxBlockBodySize",
            "maxTxSize",
            "maxBlockHeaderSize",
            "keyDeposit",
            "poolDeposit",
            "epoch",
            "kParam",
            "poolMinFee",
            "adaPerUtxoByte",
            "maxValuesSize",
            "collateralPercentage",
            "maxCollateralIns"
        ] as const).every( uintKey => canBeUInteger( pp[uintKey] ) )
    ) return false;


    if(!(
        pp.pledgeInfluence instanceof CborPositiveRational &&
        pp.expansionRate instanceof CborPositiveRational &&
        pp.treasureryGrowthRate instanceof CborPositiveRational
    )) return false

    const ppv = pp.protocolVersion;

    if(!(
        Array.isArray( ppv ) &&
        ppv.length >= 2 &&
        canBeUInteger( ppv[0] ) && canBeUInteger( ppv[1] )
    )) return false;

    const ppexecCosts = pp.execCosts;

    if(!(
        Array.isArray( ppexecCosts ) &&
        ppexecCosts.length >= 2 &&
        ppexecCosts[0] instanceof CborPositiveRational &&
        ppexecCosts[1] instanceof CborPositiveRational
    )) return false;

    if(!(
        pp.maxTxExecUnits instanceof ExBudget &&
        pp.maxBlockExecUnits instanceof ExBudget
    )) return false

    if(!(
        isCostModels( pp.costModels )
    )) return false;

    return true;
}

export function isPartialProtocolParameters( something: object ): something is Partial<ProtocolParamters>
{
    if( !ObjectUtils.isObject( something ) ) return false;

    const pp: Partial<ProtocolParamters> = something;

    if(!
        ([
            "minFeeCoefficient",
            "minFeeFixed",
            "maxBlockBodySize",
            "maxTxSize",
            "maxBlockHeaderSize",
            "keyDeposit",
            "poolDeposit",
            "epoch",
            "kParam",
            "poolMinFee",
            "adaPerUtxoByte",
            "maxValuesSize",
            "collateralPercentage",
            "maxCollateralIns"
        ] as const).every( uintKey => pp[uintKey] === undefined || canBeUInteger( pp[uintKey] ) )
    ) return false;

    if(!(
        (pp.pledgeInfluence === undefined       || pp.pledgeInfluence instanceof CborPositiveRational ) &&
        (pp.expansionRate === undefined         || pp.expansionRate instanceof CborPositiveRational ) &&
        (pp.treasureryGrowthRate === undefined  || pp.treasureryGrowthRate instanceof CborPositiveRational)
    )) return false;

    const ppv = pp.protocolVersion;

    if(!(
        ppv === undefined ||
        (
            Array.isArray( ppv ) &&
            ppv.length >= 2 &&
            canBeUInteger( ppv[0] ) && canBeUInteger( ppv[1] )
        )
    )) return false;

    const ppexecCosts = pp.execCosts;

    if(!(
        ppexecCosts === undefined ||
        (
            Array.isArray( ppexecCosts ) &&
            ppexecCosts.length >= 2 &&
            ppexecCosts[0] instanceof CborPositiveRational &&
            ppexecCosts[1] instanceof CborPositiveRational
        )
    )) return false;

    if(!(
        (pp.maxTxExecUnits === undefined        || pp.maxTxExecUnits instanceof ExBudget) &&
        (pp.maxBlockExecUnits === undefined     || pp.maxBlockExecUnits instanceof ExBudget)
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
        v: new CborUInt( forceUInteger( a ).asBigInt )
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
        execCosts,
        maxTxExecUnits,
        maxBlockExecUnits,
        costModels
    } = pps;

    const costModelsKeys = Object.keys( costModels ?? {} );

    return new CborMap([
        mapUIntEntryOrUndefined( 0, pps.minFeeCoefficient ),
        mapUIntEntryOrUndefined( 1, pps.minFeeFixed ),
        mapUIntEntryOrUndefined( 2, pps.maxBlockBodySize ),
        mapUIntEntryOrUndefined( 3, pps.maxTxSize ),
        mapUIntEntryOrUndefined( 4, pps.maxBlockHeaderSize ),
        mapUIntEntryOrUndefined( 5, pps.keyDeposit ),
        mapUIntEntryOrUndefined( 6, pps.poolDeposit ),
        mapUIntEntryOrUndefined( 7, pps.epoch ),
        mapUIntEntryOrUndefined( 8, pps.kParam ),
        kv( 9 , pps.pledgeInfluence ),
        kv( 10, pps.expansionRate ),
        kv( 11, pps.treasureryGrowthRate ),
        protocolVersion === undefined ? undefined:
        {
            k: new CborUInt( 14 ),
            v: new CborArray([
                new CborUInt( forceUInteger( protocolVersion[0] ).asBigInt ),
                new CborUInt( forceUInteger( protocolVersion[1] ).asBigInt )
            ])
        },
        mapUIntEntryOrUndefined( 16, pps.poolMinFee ),
        mapUIntEntryOrUndefined( 17, pps.adaPerUtxoByte ),
        kv( 18, 
            (costModels === undefined || 
            (!costModelsKeys.includes("PlutusV1") && !costModelsKeys.includes("PlutusV2"))) ?
                undefined :
                costModelsToCborObj( costModels )
        ),
        execCosts === undefined ? undefined:
        {
            k: new CborUInt( 19 ),
            v: new CborArray(execCosts)
        },
        kv( 20, maxTxExecUnits == undefined ? undefined : maxTxExecUnits.toCborObj() ),
        kv( 21, maxBlockExecUnits == undefined ? undefined : maxBlockExecUnits.toCborObj() ),
        mapUIntEntryOrUndefined( 22, pps.maxValuesSize ),
        mapUIntEntryOrUndefined( 23, pps.collateralPercentage ),
        mapUIntEntryOrUndefined( 24, pps.maxCollateralIns ),
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

    let execCosts: [CborPositiveRational, CborPositiveRational] | undefined = undefined;
    if( _execCosts instanceof CborArray )
    {
        const mem_price = CborPositiveRational.fromCborObjOrUndef( _execCosts.array[0] )
        const cpu_price = CborPositiveRational.fromCborObjOrUndef( _execCosts.array[1] )
        execCosts = mem_price !== undefined && cpu_price !== undefined ? [ mem_price, cpu_price ] : undefined;
    }

    const _costModels = costModelsFromCborObj( _costmdls );

    return {
        minFeeCoefficient:      fromUIntOrUndef( _minFeeCoeff ),
        minFeeFixed:            fromUIntOrUndef( _minFeeFix ),
        maxBlockBodySize:       fromUIntOrUndef( _maxBlockBodySize ),
        maxTxSize:              fromUIntOrUndef( _maxTxSize ),
        maxBlockHeaderSize:     fromUIntOrUndef( _maxBlockHeaderSize ),
        keyDeposit:             fromUIntOrUndef( _keyDep ),
        poolDeposit:            fromUIntOrUndef( _poolDep ),
        epoch:                  fromUIntOrUndef( _epoch ),
        kParam:                 fromUIntOrUndef( _kParam ),
        pledgeInfluence:        CborPositiveRational.fromCborObjOrUndef( _pledgeInfluence ),
        expansionRate:          CborPositiveRational.fromCborObjOrUndef( _expansionRate ),
        treasureryGrowthRate:   CborPositiveRational.fromCborObjOrUndef( _treasureryGrowthRate ),
        protocolVersion,
        poolMinFee:             fromUIntOrUndef( _poolMinFee ),
        adaPerUtxoByte:         fromUIntOrUndef( _adaPerUtxoByte ),
        costModels:             Object.keys( _costModels ).length === 0 ? undefined : _costModels,
        execCosts,
        maxTxExecUnits:     _maxTxExecUnits === undefined ? undefined : ExBudget.fromCborObj( _maxTxExecUnits ),
        maxBlockExecUnits:  _maxBlockExecUnits === undefined ? undefined : ExBudget.fromCborObj( _maxBlockExecUnits ),
        maxValuesSize:          fromUIntOrUndef( _maxValueSize ),
        collateralPercentage:   fromUIntOrUndef( _collatearalPerc ),
        maxCollateralIns:       fromUIntOrUndef( _maxCollIns ),
    }
}

export const defaultProtocolParameters: ProtocolParamters = ObjectUtils.freezeAll({
    minFeeCoefficient: 44,
    minFeeFixed: 155381,
    maxBlockBodySize: 73728,
    maxTxSize: 16384,
    maxBlockHeaderSize: 1100,
    keyDeposit:  2_000_000,
    poolDeposit: 500_000_000,
    epoch: 18,
    kParam: 500,
    pledgeInfluence: new CborPositiveRational( 3, 10 ),
    expansionRate: new CborPositiveRational( 3, 1000 ),
    treasureryGrowthRate: new CborPositiveRational( 2, 10 ),
    protocolVersion: [ 8, 0 ],
    poolMinFee: 340_000_000,
    adaPerUtxoByte: 34482,
    costModels: {
        PlutusV1: defaultV1Costs,
        PlutusV2: defaultV2Costs
    },
    execCosts: [
        new CborPositiveRational( 577, 1e2 ), // mem
        new CborPositiveRational( 721, 1e5 )  // cpu
    ],
    maxTxExecUnits: new ExBudget({ mem: 12_500_000, cpu: 10_000_000_000 }),
    maxBlockExecUnits: new ExBudget({ mem: 50_000_000, cpu: 40_000_000_000 }),
    maxValuesSize: 5000,
    collateralPercentage: 150,
    maxCollateralIns: 3
})

function cborRationalToNum( rat: CborPositiveRational | undefined ): number | undefined
{
    return rat === undefined ? undefined : Number( rat.num ) / Number( rat.den )
}

export function partialProtocolParamsToJson( pp: Partial<ProtocolParamters> )
{
    return {
        ...pp,
        pledgeInfluence: cborRationalToNum( pp.pledgeInfluence ),
        expansionRate: cborRationalToNum( pp.expansionRate ),
        treasureryGrowthRate: cborRationalToNum( pp.treasureryGrowthRate ),
        costModels: pp.costModels === undefined ? undefined : costModelsToJson( pp.costModels ),
        execCosts: pp.execCosts?.map( cborRationalToNum ),
        maxTxExecUnits: pp.maxTxExecUnits?.toJson(),
        maxBlockExecUnits: pp.maxBlockExecUnits?.toJson(),
    }
}