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

export default defaultV2MachineCosts;