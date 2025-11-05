import * as path from "node:path";

export function normalizeRoot(root?: string): string {
  const r = root && root.trim().length > 0 ? root : process.cwd();
  return path.resolve(r);
}

export function isRecord(x: any): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function fromJsonMaybeBoolean<T>(value: any, fallback: T): T {
  return (typeof value === typeof fallback ? (value as T) : fallback);
}