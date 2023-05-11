
import type { UPLCTerm } from "../../../../../src/onchain/UPLC/UPLCTerm";
import { TermType, tyVar } from "../type_system/types";

/**
 * @abstract
 */
export class PType
{
    /**
     * probably never used;
     * 
     * here only to make a difference from any generic object
    */
    protected readonly _isPType: true = true;
    protected readonly _PTypeUPLCTerm?: UPLCTerm;

    constructor() {}
};
