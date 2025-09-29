import { IRApp, IRConst, IRFunc, IRHoisted, IRLetted, IRNative } from "../../../IRNodes";
import { IRNativeTag } from "../../../IRNodes/IRNative/IRNativeTag";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _ir_apps } from "../../../tree_utils/_ir_apps";
import { prettyIR, prettyIRJsonStr } from "../../../utils";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { getApplicationTerms } from "../../utils/getApplicationTerms";
import { RemoveUnusedVarsCtx } from "./RemoveUnusedVarsCtx";

// New implementation strategy:
// 1. Bottom-up traverse IRFunc bodies, computing which parameters are used.
//    De Bruijn convention assumed by tests:
//      - A multi-arity IRFunc( n, body ) introduces n binders whose indices are 0..n-1 inside body
//        (index i refers to the i-th parameter, consistent with tests: (\(a b). b) uses IRVar(1)).
//      - Nested lambdas add their arity in front of existing indices (standard multi-binder extension).
// 2. Remove unused parameters by shrinking arity and re-indexing variables in the body:
//      - For each removed parameter at index p, every variable referring to a later parameter (> p) is decremented by 1.
//      - Every variable whose index >= originalArity (i.e. refers to an outer binder) is decremented by removedCount.
//      - Adjust applies recursively to nested functions: inside a nested function of arity a, only variables with index >= a
//        refer to outer scopes and must be shifted by removedCount; local ( < a ) indices untouched here.
// 3. After all functions processed, rebuild application chains so that arguments corresponding to removed parameters
//    are eliminated. We rely on metadata __usedParams stored temporarily on IRFunc nodes during step (1/2).
// 4. Return possibly new root (if application chain at root was rebuilt).

interface FuncMeta {
    __usedParams?: boolean[]; // original length = original arity; true if kept
    __originalArity?: number; // keep original for reference (debug)
}

function markAndShrink(term: IRTerm): void {
    if (term instanceof IRFunc) {
        // Recurse first so inner functions already processed
        markAndShrink(term.body);

        const originalArity = term.arity;
        if (originalArity === 0) return; // nothing to do

        const used = new Array<boolean>(originalArity).fill(false);

        // Count usages of current function parameters.
        function countLocal(node: IRTerm, shadow: number) {
            if (node instanceof IRVar || node instanceof IRSelfCall) {
                const idx = (node as IRVar | IRSelfCall).dbn;
                if (idx >= shadow) {
                    const rel = idx - shadow; // relative to this function's parameters
                    if (rel < originalArity) used[rel] = true;
                }
                return;
            }
            if (node instanceof IRFunc) {
                // Enter nested function: its parameters shadow further lookups.
                countLocal(node.body, shadow + node.arity);
                return;
            }
            if (node instanceof IRApp) {
                countLocal(node.fn, shadow);
                countLocal(node.arg, shadow);
                return;
            }
            // Generic descent for other nodes with children
            if (typeof (node as any).children === "function") {
                for (const c of (node as any).children()) countLocal(c, shadow);
            }
        }

        countLocal(term.body, 0);

        // Determine if any unused
        if (used.every(u => u)) {
            (term as IRFunc & FuncMeta).__usedParams = used;
            (term as IRFunc & FuncMeta).__originalArity = originalArity;
            return; // no change
        }

        const shiftMap: number[] = new Array(originalArity);
        let removedBefore = 0;
        let removedCount = 0;
        for (let i = 0; i < originalArity; i++) {
            if (used[i]) {
                shiftMap[i] = i - removedBefore;
            } else {
                shiftMap[i] = -1; // removed
                removedBefore++;
                removedCount++;
            }
        }

        // Adjust indices in body
        function adjust(node: IRTerm, shadow: number): void {
            if (node instanceof IRVar || node instanceof IRSelfCall) {
                let idx = (node as IRVar | IRSelfCall).dbn;
                if (idx >= shadow) {
                    const rel = idx - shadow;
                    if (rel < originalArity) {
                        const mapped = shiftMap[rel];
                        if (mapped === -1) {
                            // Should never occur: variable referencing removed param but marked unused => unreachable variable
                            // We simply map to an invalid state by throwing.
                            throw new Error("Invariant broken: found use of supposedly unused parameter");
                        }
                        (node as IRVar | IRSelfCall).dbn = shadow + mapped;
                    } else {
                        // Outer variable; indices shrink by removedCount
                        (node as IRVar | IRSelfCall).dbn = idx - removedCount;
                    }
                }
                return;
            }
            if (node instanceof IRFunc) {
                // Nested: its local parameters shadow; only outer refs (>= shadow + node.arity) need shift after we recurse.
                adjust(node.body, shadow + node.arity);
                return;
            }
            if (node instanceof IRApp) {
                adjust(node.fn, shadow);
                adjust(node.arg, shadow);
                return;
            }
            if (typeof (node as any).children === "function") {
                for (const c of (node as any).children()) adjust(c, shadow);
            }
        }

        adjust(term.body, 0);

        // Shrink arity
        term.arity = originalArity - removedCount;
        (term as IRFunc & FuncMeta).__usedParams = used; // keep original array for application reconstruction
        (term as IRFunc & FuncMeta).__originalArity = originalArity;
        return;
    }

    // Non-function terms: recurse
    if (term instanceof IRApp) {
        markAndShrink(term.fn);
        markAndShrink(term.arg);
        return;
    }
    if (term instanceof IRVar || term instanceof IRSelfCall) return;
    if (typeof (term as any).children === "function") {
        for (const c of (term as any).children()) markAndShrink(c);
    }
}

// Rebuild application chains eliminating arguments bound to removed parameters.
function rebuild(term: IRTerm): IRTerm {
    if (term instanceof IRApp) {
        // Collect spine
        const args: IRTerm[] = [];
        let head: IRTerm = term;
        while (head instanceof IRApp) { args.push(head.arg); head = head.fn; }
        args.reverse(); // now left-to-right

        head = rebuild(head); // rebuild head (might transform inside)
        for (let i = 0; i < args.length; i++) args[i] = rebuild(args[i]);

        if (head instanceof IRFunc) {
            const meta = head as IRFunc & FuncMeta;
            const used = meta.__usedParams;
            const originalArity = meta.__originalArity ?? head.arity;
            if (used && used.length === originalArity && originalArity !== head.arity) {
                // Filter args according to original used array (length = original arity)
                const filtered: IRTerm[] = [];
                for (let i = 0; i < used.length && i < args.length; i++) if (used[i]) filtered.push(args[i]);
                // Rebuild chain according to new arity (head.arity == filtered.length)
                let newTerm: IRTerm = head;
                for (const a of filtered) newTerm = new IRApp(newTerm as any, a as any);
                return newTerm;
            }
        }

        // Default: rebuild chain with possibly transformed head/args as they were
        let rebuilt: IRTerm = head;
        for (const a of args) rebuilt = new IRApp(rebuilt as any, a as any);
        return rebuilt;
    }
    if (term instanceof IRFunc) {
        term.body = rebuild(term.body);
        return term;
    }
    if (term instanceof IRVar || term instanceof IRSelfCall) return term;
    if (typeof (term as any).children === "function") {
        // Recurse generically but keep same node reference
        const ch = (term as any).children();
        for (const c of ch) rebuild(c); // assume children mutate in place if needed
    }
    return term;
}

export function removeUnusedVarsAndReturnRoot(term: IRTerm): IRTerm {
    markAndShrink(term);
    const newRoot = rebuild(term);
    return newRoot;
}