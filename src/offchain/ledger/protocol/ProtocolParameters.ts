import CborPositiveRational from "../../../cbor/extra/CborRational";
import { canBeUInteger, CanBeUInteger } from "../../../types/ints/Integer";
import ObjectUtils from "../../../utils/ObjectUtils";
import type Coin from "../Coin";
import CostModels, { isCostModels } from "../CostModels";
import type Epoch from "../Epoch";
import ExecUnits from "../ExecUnits";

export interface ProtocolParamters {
    minfeeA: CanBeUInteger,
    minfeeB: CanBeUInteger,
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
    protocolVerstion: [ CanBeUInteger, CanBeUInteger ],
    poolMinFee: Coin,
    adaPerUtxoByte: Coin,
    costModels: CostModels,
    execCosts: [
        mem_price: CborPositiveRational,
        step_price: CborPositiveRational,
    ]
    maxTxExecUnits: ExecUnits,
    maxBlockExecUnits: ExecUnits,
    maxValuesSize: CanBeUInteger,
    maxCollateralIns: CanBeUInteger
}

export default ProtocolParamters;

export function isProtocolParameters( something: any ): something is ProtocolParamters
{
    const expectedKeys = [
        "minfeeA",
        "minfeeB",
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
        "protocolVerstion",
        "poolMinFee",
        "adaPerUtxoByte",
        "costModels",
        "execCosts",
        "maxTxExecUnits",
        "maxBlockExecUnits",
        "maxValuesSize",
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
            "minfeeA",
            "minfeeB",
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
            "maxCollateralIns"
        ] as const).every( uintKey => canBeUInteger( pp[uintKey] ) )
    ) return false;

    if(!(
        pp.pledgeInfluence instanceof CborPositiveRational &&
        pp.expansionRate instanceof CborPositiveRational &&
        pp.treasureryGrowthRate instanceof CborPositiveRational
    )) return false

    const ppv = pp.protocolVerstion;

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
        pp.maxTxExecUnits instanceof ExecUnits &&
        pp.maxBlockExecUnits instanceof ExecUnits
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
            "minfeeA",
            "minfeeB",
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
            "maxCollateralIns"
        ] as const).every( uintKey => pp[uintKey] === undefined || canBeUInteger( pp[uintKey] ) )
    ) return false;

    if(!(
        (pp.pledgeInfluence === undefined       || pp.pledgeInfluence instanceof CborPositiveRational ) &&
        (pp.expansionRate === undefined         || pp.expansionRate instanceof CborPositiveRational ) &&
        (pp.treasureryGrowthRate === undefined  || pp.treasureryGrowthRate instanceof CborPositiveRational)
    )) return false;

    const ppv = pp.protocolVerstion;

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
        (pp.maxTxExecUnits === undefined        || pp.maxTxExecUnits instanceof ExecUnits) &&
        (pp.maxBlockExecUnits === undefined     || pp.maxBlockExecUnits instanceof ExecUnits)
    )) return false

    if(!(
        pp.costModels === undefined || isCostModels( pp.costModels )
    )) return false;

    return true;
}