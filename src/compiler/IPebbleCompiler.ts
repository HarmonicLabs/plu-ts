import { CompilerOptions } from "../IR/toUPLC/CompilerOptions";
import { CompilerIoApi } from "./io/CompilerIoApi";

export interface IPebbleCompiler {
    readonly cfg: CompilerOptions;
    readonly io: CompilerIoApi;
}