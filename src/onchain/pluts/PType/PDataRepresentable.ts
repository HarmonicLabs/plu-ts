import PType from ".";
import type { PData, Term } from "..";
import type { TermFn } from "../PTypes";

import JsRuntime from "../../../utils/JsRuntime";


/**
 * @abstract
 */
export default class PDataRepresentable extends PType
{
    constructor() { super(); }


    static get fromDataTerm(): TermFn<[ PData ], PDataRepresentable>
    {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'PDataRepresentable' is an abstract class; an extension of the class did not implemented the 'fromData' static method"
        ); 
    }
    /**
     * @deprecated try to use 'fromDataTerm.$'
     */
    static fromData( data: Term<PData> ): Term<PDataRepresentable>
    {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'PDataRepresentable' is an abstract class; an extension of the class did not implemented the 'fromData' static method"
        );
    }

    static get toDataTerm(): TermFn<[ any/*PDataRepresentable*/ ], PData>
    {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'PDataRepresentable' is an abstract class; an extension of the class did not implemented the 'toData' static method"
        );
    }
    /**
     * @deprecated try to use 'toDataTerm.$'
     */
    static toData( term: Term<any> ): Term<PData>
    {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'PDataRepresentable' is an abstract class; an extension of the class did not implemented the 'toData' static method"
        );
    }
}