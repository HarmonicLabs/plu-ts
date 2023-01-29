import { AnyV2CostModel, CostModelPlutusV2, toCostModelV2 } from "../../../offchain/ledger/CostModels";
import { forceBigUInt } from "../../../types/ints/Integer";
import ObjectUtils from "../../../utils/ObjectUtils";
import ExBudget from "./ExBudget";

export interface MachineCosts {
    startup: ExBudget,
    var: ExBudget,
    constant: ExBudget,
    lam: ExBudget,
    delay: ExBudget,
    force: ExBudget,
    apply: ExBudget,
    builtinNode: ExBudget
};

export const defaultV1MachineCosts: MachineCosts = Object.freeze({
    startup:        new ExBudget({ mem: 100, cpu: 100 }),
    var:            new ExBudget({ mem: 100, cpu: 23000 }),
    constant:       new ExBudget({ mem: 100, cpu: 23000 }),
    lam:            new ExBudget({ mem: 100, cpu: 23000 }),
    delay:          new ExBudget({ mem: 100, cpu: 23000 }),
    force:          new ExBudget({ mem: 100, cpu: 23000 }),
    apply:          new ExBudget({ mem: 100, cpu: 23000 }),
    builtinNode:    new ExBudget({ mem: 100, cpu: 23000 }),
});

export const defaultV2MachineCosts: MachineCosts = Object.freeze({
    startup:        new ExBudget({ mem: 100, cpu: 100 }),
    var:            new ExBudget({ mem: 100, cpu: 23000 }),
    constant:       new ExBudget({ mem: 100, cpu: 23000 }),
    lam:            new ExBudget({ mem: 100, cpu: 23000 }),
    delay:          new ExBudget({ mem: 100, cpu: 23000 }),
    force:          new ExBudget({ mem: 100, cpu: 23000 }),
    apply:          new ExBudget({ mem: 100, cpu: 23000 }),
    builtinNode:    new ExBudget({ mem: 100, cpu: 23000 }),
});

export default function costModelV2ToMachineCosts( costsV2: AnyV2CostModel ): MachineCosts
{
    const costs = toCostModelV2( costsV2 );
    const result = {};

    type CekCostKey = keyof CostModelPlutusV2 & `cek${string}`;
    type CekCpuCostKey = CekCostKey & `${string}-exBudgetCPU`;
    type CekMemCostKey = CekCostKey & `${string}-exBudgetMemory`;

    function add( k: keyof MachineCosts, cpuKey: CekCpuCostKey, memKey: CekMemCostKey ): void
    {
        const val = new ExBudget({
            mem: forceBigUInt( costs[memKey] ),
            cpu: forceBigUInt( costs[cpuKey] )
        });

        ObjectUtils.definePropertyIfNotPresent(
            result, k,
            {
                get: () => val.clone(),
                set: (...whatever: any[]) => {},
                enumerable: true,
                configurable: false
            }
        );
    }

    add("startup",      "cekStartupCost-exBudgetCPU",   "cekStartupCost-exBudgetMemory" );
    add("var",          "cekVarCost-exBudgetCPU",       "cekVarCost-exBudgetMemory")
    add("constant",     "cekConstCost-exBudgetCPU",     "cekConstCost-exBudgetMemory" );
    add("lam",          "cekLamCost-exBudgetCPU",       "cekLamCost-exBudgetMemory" );
    add("delay",        "cekDelayCost-exBudgetCPU",     "cekDelayCost-exBudgetMemory" );
    add("force",        "cekForceCost-exBudgetCPU",     "cekForceCost-exBudgetMemory" );
    add("apply",        "cekApplyCost-exBudgetCPU",     "cekApplyCost-exBudgetMemory"   );
    add("builtinNode",  "cekBuiltinCost-exBudgetCPU",   "cekBuiltinCost-exBudgetMemory" );

    return result as any;
}