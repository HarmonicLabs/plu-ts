import { IRTerm } from "../../IRTerm";

export type IRTermWithDepth = IRTerm & { depth: number };

export function defineDepth( term: IRTerm, depth: number ): IRTermWithDepth
{
    return Object.defineProperty(
        term, "depth", {
            value: depth,
            writable: true,
            enumerable: true,
            configurable: false
        }
    ) as any;
}