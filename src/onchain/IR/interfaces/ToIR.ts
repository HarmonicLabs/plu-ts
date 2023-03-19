import { IRTerm } from "../IRTerm";

export interface ToIR {
    toIR: ( dbn?: number | bigint ) => IRTerm 
}