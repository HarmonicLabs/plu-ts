import CborPositiveRational from "../../../cbor/extra/CborRational";
import type { CanBeUInteger } from "../../../types/ints/Integer";
import type Coin from "../../Coin";
import CostModels from "../CostModels";
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