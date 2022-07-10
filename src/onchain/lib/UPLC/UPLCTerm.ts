import UPLCVar from "./UPLCTerms/UPLCVar";
import Delay from "./UPLCTerms/Delay";
import Lambda from "./UPLCTerms/Lambda";
import Application from "./UPLCTerms/Application";
import Const from "./UPLCTerms/Const";
import Force from "./UPLCTerms/Force";
import ErrorUPLC from "./UPLCTerms/ErrorUPLC";
import Builtin from "./UPLCTerms/Builtin";

type UPLCTerm 
    = UPLCVar       // UPLCEvaluableToPrimitive
    | Delay
    | Lambda
    | Application   // UPLCEvaluableToPrimitive
    | Const         // UPLCEvaluableToPrimitive
    | Force         // UPLCEvaluableToPrimitive
    | ErrorUPLC     // UPLCEvaluableToPrimitive
    | Builtin;      // UPLCEvaluableToPrimitive

export default UPLCTerm;

export function isUPLCTerm( t: UPLCTerm ): boolean
{
    return (
        t instanceof UPLCVar        ||
        t instanceof Delay          ||
        t instanceof Lambda         ||
        t instanceof Application    ||
        t instanceof Const          ||
        t instanceof Force          ||
        t instanceof ErrorUPLC      ||
        t instanceof Builtin
    );
}