import { CompilerOptions, defaultOptions } from "@harmoniclabs/pebble";
import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";

export interface CliCompileFlags {
  config?: string;
  entry?: string;
  output?: string;
}

export interface CliCompileOptions {
  root: string;
  entry: string;
  outDir: string;
  output?: string;
  config: CompilerOptions;
  configPath?: string;
}

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

export function completeCompileOptions(flags: CliCompileFlags): CliCompileOptions {
  const root = normalizeRoot();

  const configPath = path.resolve(root, flags.config ?? "./pebble.config.json");
  let config: CompilerOptions = defaultOptions;
  if (existsSync(configPath)) {
    try {
      const txt = readFileSync(configPath, "utf8");
      const parsed = JSON.parse(txt);
      if (isRecord(parsed)) config = {
        ...defaultOptions,
        ...parsed,
      } as CompilerOptions;
    } catch {
      // ignore malformed config; proceed with flags/defaults
    }
  }

  const cfgEntry = typeof config?.entry === "string" ? String(config!.entry) : undefined;
  const entry = cfgEntry ?? (flags.entry ?? "./src/index.pebble");

  const desiredOutput = flags.output;
  const cfgOutDir = typeof config?.outDir === "string" ? String(config!.outDir) : undefined;
  let outDir = cfgOutDir ?? (desiredOutput ? path.dirname(desiredOutput) : "./out");
  if (desiredOutput === "./out.flat") {
    // keep sane default when user didn't set anything explicitly
    outDir = cfgOutDir ?? "./out";
  }

  return {
    root,
    entry,
    outDir,
    output: desiredOutput,
    config,
    configPath: existsSync(configPath) ? configPath : undefined,
  };
}

export default completeCompileOptions;
