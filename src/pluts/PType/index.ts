import { UPLCTerm } from "@harmoniclabs/uplc";

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
