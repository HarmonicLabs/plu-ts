import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";

import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { AnyV2CostModel, AnyV1CostModel, toCostModelV2, costModelV1ToFakeV2, isCostModelsV2 } from "../../../../offchain/ledger/CostModels";
import { forceBigUInt } from "../../../../types/ints/Integer";
import { UPLCBuiltinTag } from "../../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import { CostFunction, FixedCost, Linear1, Linear2InBothAdd, Linear2InBothMult, Linear2InBothSub, Linear2InMax, Linear2InMin, Linear2InY, Linear3InY, Linear3InZ, LinearOnEqualXY, OneArg, SixArgs, ThreeArgs, TwoArgs, XGtEqOrConst, YGtEqOrConst } from "./costFunctions";

export type ExecCostFuncs<F extends CostFunction> = {
    mem: F,
    cpu: F
};

export type BuiltinCostsOf<Tag extends UPLCBuiltinTag> =
    Tag extends UPLCBuiltinTag.addInteger ?                  ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.subtractInteger ?             ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.multiplyInteger ?             ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.divideInteger ?               ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.quotientInteger ?             ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.remainderInteger ?            ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.modInteger ?                  ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.equalsInteger ?               ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.lessThanInteger ?             ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.lessThanEqualInteger ?        ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.appendByteString ?            ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.consByteString ?              ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.sliceByteString ?             ExecCostFuncs<ThreeArgs> :
    Tag extends UPLCBuiltinTag.lengthOfByteString ?          ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.indexByteString ?             ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.equalsByteString ?            ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.lessThanByteString ?          ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.lessThanEqualsByteString ?    ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.sha2_256 ?                    ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.sha3_256 ?                    ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.blake2b_256 ?                 ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.verifyEd25519Signature ?      ExecCostFuncs<ThreeArgs> :
    Tag extends UPLCBuiltinTag.appendString ?                ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.equalsString ?                ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.encodeUtf8 ?                  ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.decodeUtf8 ?                  ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.ifThenElse ?                  ExecCostFuncs<ThreeArgs> :
    Tag extends UPLCBuiltinTag.chooseUnit ?                  ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.trace ?                       ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.fstPair ?                     ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.sndPair ?                     ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.chooseList ?                  ExecCostFuncs<ThreeArgs> :
    Tag extends UPLCBuiltinTag.mkCons ?                      ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.headList ?                    ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.tailList ?                    ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.nullList ?                    ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.chooseData ?                  ExecCostFuncs<SixArgs> :
    Tag extends UPLCBuiltinTag.constrData ?                  ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.mapData ?                     ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.listData ?                    ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.iData ?                       ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.bData ?                       ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.unConstrData ?                ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.unMapData ?                   ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.unListData ?                  ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.unIData ?                     ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.unBData ?                     ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.equalsData ?                  ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.mkPairData ?                  ExecCostFuncs<TwoArgs> :
    Tag extends UPLCBuiltinTag.mkNilData ?                   ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.mkNilPairData ?               ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.serialiseData ?                   ExecCostFuncs<OneArg> :
    Tag extends UPLCBuiltinTag.verifyEcdsaSecp256k1Signature ?   ExecCostFuncs<ThreeArgs> :
    Tag extends UPLCBuiltinTag.verifySchnorrSecp256k1Signature ? ExecCostFuncs<ThreeArgs>:
    never;

type ToBuiltinCache = {
    [x in UPLCBuiltinTag]: BuiltinCostsOf<x>;
};

export function costModelV1ToBuiltinCosts( costmdls: AnyV1CostModel ): <Tag extends UPLCBuiltinTag>( tag: Tag ) => BuiltinCostsOf<Tag>
{
    return costModelV2ToBuiltinCosts( costModelV1ToFakeV2( costmdls ) )
}

export function costModelV2ToBuiltinCosts( costmdls: AnyV2CostModel ): <Tag extends UPLCBuiltinTag>( tag: Tag ) => BuiltinCostsOf<Tag>
{
    const costs = toCostModelV2( costmdls );
    JsRuntime.assert(
        isCostModelsV2( costs ),
        "invalid cost models passed"
    );
    
    const cache: ToBuiltinCache = {} as any;

    return <Tag extends UPLCBuiltinTag>( tag: Tag ) => {

        if( ObjectUtils.hasOwn( cache, tag ) ) return cache[tag];

        function readonly( costs: ExecCostFuncs<CostFunction> ): BuiltinCostsOf<Tag> 
        {
            const result: BuiltinCostsOf<Tag>  = {} as any;

            ObjectUtils.defineReadOnlyProperty( result, "mem", costs.mem );
            ObjectUtils.defineReadOnlyProperty( result, "cpu", costs.cpu );

            // save in cache
            ObjectUtils.defineReadOnlyProperty( cache, tag, result );

            return result;
        }

        switch( tag )
        {
            case UPLCBuiltinTag.addInteger:
                return readonly({
                    cpu: new Linear2InMax(
                        forceBigUInt( costs["addInteger-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["addInteger-cpu-arguments-slope"] )
                    ),
                    mem: new Linear2InMax(
                        forceBigUInt( costs["addInteger-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["addInteger-memory-arguments-slope"] )
                    )
                });
            break;
            case UPLCBuiltinTag.subtractInteger:
                return readonly({
                    cpu: new Linear2InMax(
                        forceBigUInt( costs["subtractInteger-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["subtractInteger-cpu-arguments-slope"] )
                    ),
                    mem: new Linear2InMax(
                        forceBigUInt( costs["subtractInteger-memory-arguments-intercept"] ),
                        forceBigUInt( costs["subtractInteger-memory-arguments-slope"] ),
                    )
                })
            break;
            case UPLCBuiltinTag.multiplyInteger:
                return readonly({
                    cpu: new Linear2InBothAdd(
                        forceBigUInt( costs["multiplyInteger-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["multiplyInteger-cpu-arguments-slope"] ),
                    ),
                    mem: new Linear2InBothAdd(
                        forceBigUInt( costs["multiplyInteger-memory-arguments-intercept"] ),
                        forceBigUInt( costs["multiplyInteger-memory-arguments-slope"] ),
                    ) 
                })
            break;
            case UPLCBuiltinTag.divideInteger:
                return readonly({
                    cpu: new Linear2InBothSub(
                        forceBigUInt( costs["divideInteger-cpu-arguments-model-arguments-intercept"]) ,
                        forceBigUInt( costs["divideInteger-cpu-arguments-model-arguments-slope"] ),
                        forceBigUInt( costs["divideInteger-cpu-arguments-constant"] )
                    ),
                    mem: new Linear2InBothSub(
                        forceBigUInt( costs["divideInteger-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["divideInteger-memory-arguments-slope"] ),
                        forceBigUInt( costs["divideInteger-memory-arguments-minimum"] )
                    )
                });
            break;
            case UPLCBuiltinTag.quotientInteger:
                return readonly({
                    cpu: new XGtEqOrConst(
                        forceBigUInt( costs["quotientInteger-cpu-arguments-constant"] ),
                        new Linear2InBothMult(
                            forceBigUInt( costs["quotientInteger-cpu-arguments-model-arguments-intercept"] ),
                            forceBigUInt( costs["quotientInteger-cpu-arguments-model-arguments-slope"] ),
                        )
                    ),
                    mem: new Linear2InBothSub(
                        forceBigUInt( costs["quotientInteger-memory-arguments-intercept"] ),
                        forceBigUInt( costs["quotientInteger-memory-arguments-slope"] ),
                        forceBigUInt( costs["quotientInteger-memory-arguments-minimum"] )
                    )
                })
            break;
            case UPLCBuiltinTag.remainderInteger:
                return readonly({
                    cpu: new XGtEqOrConst(
                        forceBigUInt( costs["remainderInteger-cpu-arguments-constant"] ),
                        new Linear2InBothMult(
                            forceBigUInt( costs["remainderInteger-cpu-arguments-model-arguments-intercept"] ),
                            forceBigUInt( costs["remainderInteger-cpu-arguments-model-arguments-slope"] ),
                        )
                    ),
                    mem: new Linear2InBothSub(
                        forceBigUInt( costs["remainderInteger-memory-arguments-intercept"] ),
                        forceBigUInt( costs["remainderInteger-memory-arguments-slope"] ),
                        forceBigUInt( costs["remainderInteger-memory-arguments-minimum"] ),
                    )
                });
            break;
            case UPLCBuiltinTag.modInteger:
                return readonly({
                    cpu: new XGtEqOrConst(
                        forceBigUInt( costs["modInteger-cpu-arguments-constant"] ),
                        new Linear2InBothMult(
                            forceBigUInt( costs["modInteger-cpu-arguments-model-arguments-intercept"] ),
                            forceBigUInt( costs["modInteger-cpu-arguments-model-arguments-slope"] ),
                        )
                    ),
                    mem: new Linear2InBothSub(
                        forceBigUInt( costs["modInteger-memory-arguments-intercept"] ),
                        forceBigUInt( costs["modInteger-memory-arguments-slope"] ),
                        forceBigUInt( costs["modInteger-memory-arguments-minimum"] ),
                    )
                });
            break;
            case UPLCBuiltinTag.equalsInteger:
                return readonly({
                    cpu: new Linear2InMin(
                        forceBigUInt( costs["equalsInteger-cpu-arguments-intercept"]),
                        forceBigUInt( costs["equalsInteger-cpu-arguments-slope"] )
                    ),
                    mem: new FixedCost( forceBigUInt( costs["equalsInteger-memory-arguments"]) )
                });
            break;
            case UPLCBuiltinTag.lessThanInteger:
                return readonly({
                    cpu: new Linear2InMin(
                        forceBigUInt( costs["lessThanInteger-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["lessThanInteger-cpu-arguments-slope"] ),
                    ),
                    mem: new FixedCost( forceBigUInt( costs["lessThanInteger-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.lessThanEqualInteger:
                return readonly({
                    cpu: new Linear2InMin(
                        forceBigUInt( costs["lessThanEqualsInteger-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["lessThanEqualsInteger-cpu-arguments-slope"] ),
                    ),
                    mem: new FixedCost( forceBigUInt( costs["lessThanEqualsInteger-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.appendByteString:
                return readonly({
                    cpu: new Linear2InBothAdd(
                        forceBigUInt( costs["appendByteString-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["appendByteString-cpu-arguments-slope"] )
                    ),
                    mem: new Linear2InBothAdd(
                        forceBigUInt( costs["appendByteString-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["appendByteString-memory-arguments-slope"] )
                    )
                });
            break;
            case UPLCBuiltinTag.consByteString:
                return readonly({
                    cpu: new Linear2InY(
                        forceBigUInt( costs["consByteString-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["consByteString-cpu-arguments-slope"] )
                    ),
                    mem: new Linear2InBothAdd(
                        forceBigUInt( costs["consByteString-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["consByteString-memory-arguments-slope"] )
                    )
                });
            break;
            case UPLCBuiltinTag.sliceByteString:
                return readonly({
                    mem: new Linear3InZ(
                        forceBigUInt( costs["sliceByteString-memory-arguments-intercept"] ),
                        forceBigUInt( costs["sliceByteString-memory-arguments-slope"] ),
                    ),
                    cpu: new Linear3InZ(
                        forceBigUInt( costs["sliceByteString-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["sliceByteString-cpu-arguments-slope"] ),
                    )
                })
            break;
            case UPLCBuiltinTag.lengthOfByteString:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["lengthOfByteString-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["lengthOfByteString-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.indexByteString:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["indexByteString-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["indexByteString-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.equalsByteString:
                return readonly({
                    cpu: new LinearOnEqualXY(
                        forceBigUInt( costs["equalsByteString-cpu-arguments-intercept"]),
                        forceBigUInt( costs["equalsByteString-cpu-arguments-slope"] ),
                        forceBigUInt( costs["equalsByteString-cpu-arguments-constant"] ),
                    ),
                    mem: new FixedCost( forceBigUInt( costs["equalsByteString-memory-arguments"]) )
                });
            break;
            case UPLCBuiltinTag.lessThanByteString:
                return readonly({
                    cpu: new Linear2InMin(
                        forceBigUInt( costs["lessThanByteString-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["lessThanByteString-cpu-arguments-slope"] ),
                    ),
                    mem: new FixedCost( forceBigUInt( costs["lessThanByteString-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.lessThanEqualsByteString:
                return readonly({
                    cpu: new Linear2InMin(
                        forceBigUInt( costs["lessThanEqualsByteString-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["lessThanEqualsByteString-cpu-arguments-slope"] ),
                    ),
                    mem: new FixedCost( forceBigUInt( costs["lessThanEqualsByteString-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.sha2_256:
                return readonly({
                    cpu: new Linear1(
                        forceBigUInt( costs["sha2_256-cpu-arguments-intercept"] ) ,
                        forceBigUInt( costs["sha2_256-cpu-arguments-slope"] ) 
                    ),
                    mem: new FixedCost( forceBigUInt( costs["sha2_256-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.sha3_256:
                return readonly({
                    cpu: new Linear1(
                        forceBigUInt( costs["sha3_256-cpu-arguments-intercept"] ) ,
                        forceBigUInt( costs["sha3_256-cpu-arguments-slope"] ) 
                    ),
                    mem: new FixedCost( forceBigUInt( costs["sha3_256-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.blake2b_256:
                return readonly({
                    cpu: new Linear1(
                        forceBigUInt( costs["blake2b_256-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["blake2b_256-cpu-arguments-slope"] )
                    ),
                    mem: new FixedCost( forceBigUInt( costs["blake2b_256-memory-arguments"]) )
                });
            break;
            case UPLCBuiltinTag.verifyEd25519Signature:
                return readonly({
                    cpu: new Linear3InZ(
                        forceBigUInt( costs["verifyEd25519Signature-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["verifyEd25519Signature-cpu-arguments-slope"] )
                    ),
                    mem: new FixedCost( forceBigUInt( costs["verifyEd25519Signature-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.appendString:
                return readonly({
                    cpu: new Linear2InBothAdd(
                        forceBigUInt( costs["appendString-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["appendString-cpu-arguments-slope"] )
                    ),
                    mem: new Linear2InBothAdd(
                        forceBigUInt( costs["appendString-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["appendString-memory-arguments-slope"] )
                    )
                });
            break;
            case UPLCBuiltinTag.equalsString:
                return readonly({
                    cpu: new LinearOnEqualXY(
                        forceBigUInt( costs["equalsString-cpu-arguments-intercept"]),
                        forceBigUInt( costs["equalsString-cpu-arguments-slope"] ),
                        forceBigUInt( costs["equalsString-cpu-arguments-constant"] )
                    ),
                    mem: new FixedCost( forceBigUInt( costs["equalsString-memory-arguments"]) )
                });
            break;
            case UPLCBuiltinTag.encodeUtf8:
                return readonly({
                    cpu: new Linear1(
                        forceBigUInt( costs["encodeUtf8-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["encodeUtf8-cpu-arguments-slope"] )
                    ),
                    mem: new Linear1(
                        forceBigUInt( costs["encodeUtf8-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["encodeUtf8-memory-arguments-slope"] )
                    )
                });
            break;
            case UPLCBuiltinTag.decodeUtf8:
                return readonly({
                    cpu: new Linear1(
                        forceBigUInt( costs["decodeUtf8-cpu-arguments-intercept"]) ,
                        forceBigUInt( costs["decodeUtf8-cpu-arguments-slope"] )
                    ),
                    mem: new Linear1(
                        forceBigUInt( costs["decodeUtf8-memory-arguments-intercept"]) ,
                        forceBigUInt( costs["decodeUtf8-memory-arguments-slope"] )
                    )
                });
            break;
            case UPLCBuiltinTag.ifThenElse:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["ifThenElse-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["ifThenElse-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.chooseUnit:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["chooseUnit-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["chooseUnit-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.trace:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["trace-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["trace-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.fstPair:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["fstPair-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["fstPair-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.sndPair:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["sndPair-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["sndPair-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.chooseList:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["chooseList-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["chooseList-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.mkCons:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["mkCons-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["mkCons-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.headList:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["headList-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["headList-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.tailList:
                return readonly({
                    cpu: new FixedCost( forceBigUInt(  costs["tailList-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt(  costs["tailList-memory-arguments"] ) )
                })
            break;
            case UPLCBuiltinTag.nullList:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["nullList-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["nullList-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.chooseData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["chooseData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["chooseData-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.constrData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["constrData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["constrData-memory-arguments"] ) ),
                });
            break;
            case UPLCBuiltinTag.mapData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["mapData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["mapData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.listData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["listData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["listData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.iData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["iData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["iData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.bData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["bData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["bData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.unConstrData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["unConstrData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["unConstrData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.unMapData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["unMapData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["unMapData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.unListData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["unListData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["unListData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.unIData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["unIData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["unIData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.unBData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["unBData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["unBData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.equalsData:
                return readonly({
                    cpu: new Linear2InMin(
                        forceBigUInt( costs["equalsData-cpu-arguments-intercept"]),
                        forceBigUInt( costs["equalsData-cpu-arguments-slope"] )
                    ),
                    mem: new FixedCost( forceBigUInt( costs["equalsData-memory-arguments"]) )
                });
            break;
            case UPLCBuiltinTag.mkPairData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["mkPairData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["mkPairData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.mkNilData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["mkNilData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["mkNilData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.mkNilPairData:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["mkNilPairData-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["mkNilPairData-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.serialiseData:
                return readonly({
                    cpu: new Linear1(
                        forceBigUInt( costs["serialiseData-cpu-arguments-intercept"] ), 
                        forceBigUInt( costs["serialiseData-cpu-arguments-slope"] ), 
                    ),
                    mem: new Linear1(
                        forceBigUInt( costs["serialiseData-memory-arguments-intercept"] ), 
                        forceBigUInt( costs["serialiseData-memory-arguments-slope"] ), 
                    )
                })
            break;
            case UPLCBuiltinTag.verifyEcdsaSecp256k1Signature:
                return readonly({
                    cpu: new FixedCost( forceBigUInt( costs["verifyEcdsaSecp256k1Signature-cpu-arguments"] ) ),
                    mem: new FixedCost( forceBigUInt( costs["verifyEcdsaSecp256k1Signature-memory-arguments"] ) )
                });
            break;
            case UPLCBuiltinTag.verifySchnorrSecp256k1Signature:
                return readonly({
                    cpu: new Linear3InY(
                        forceBigUInt( costs["verifySchnorrSecp256k1Signature-cpu-arguments-intercept"] ),
                        forceBigUInt( costs["verifySchnorrSecp256k1Signature-cpu-arguments-slope"] )
                    ),
                    mem: new FixedCost( forceBigUInt( costs["verifySchnorrSecp256k1Signature-memory-arguments"] ) )
                });
            break;
        }
    
        throw new BasePlutsError("unmatched builtin cost")
    }
}