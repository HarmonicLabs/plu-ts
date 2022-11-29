import type { TermType } from "../Term/Type/base";
import type UPLCTerm from "../../UPLC/UPLCTerm";

import Type from "../Term/Type/base";


/**
 * @abstract
 */
export default class PType
{
    /**
     * probably never used;
     * 
     * here only to make a difference from any generic object
    */
    protected readonly _isPType: true = true;
    protected readonly _PTypeUPLCTerm?: UPLCTerm;

    constructor() {}

    static get termType(): TermType { return Type.Any };
    static get type(): TermType { return Type.Any };
};
