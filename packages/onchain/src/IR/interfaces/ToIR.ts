import { IRTerm } from "../IRTerm";
import { CompilerOptions } from "../toUPLC/CompilerOptions";

export interface ToIR {
    toIR: ( config: CompilerOptions, dbn?: number | bigint ) => IRTerm 
}