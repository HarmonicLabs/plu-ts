import { UPLCTerm } from "../UPLCTerm";

export interface ToUPLC {
    toUPLC: ( dbn?: number | bigint ) => UPLCTerm
}