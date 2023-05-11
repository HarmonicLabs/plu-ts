import { IRConst } from "../IRNodes/IRConst";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRTerm } from "../IRTerm";
import { IRApp } from "../IRNodes/IRApp";
import { IRError } from "../IRNodes/IRError";
import { IRNative } from "../IRNodes/IRNative";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRVar } from "../IRNodes/IRVar";
import { IRForced } from "../IRNodes/IRForced";
import { IRDelayed } from "../IRNodes/IRDelayed";

function _isClosedIRTerm( term: IRTerm, dbn: number ): boolean
{
    if( term instanceof IRVar )
    {
        return term.dbn < dbn;
    }

    if( term instanceof IRFunc )
    {
        return _isClosedIRTerm( term.body, dbn + term.arity );
    }

    if( term instanceof IRApp )
    {
        return _isClosedIRTerm( term.fn, dbn ) && _isClosedIRTerm( term.arg, dbn );
    }
    
    if( term instanceof IRConst ) return true;
    if( term instanceof IRError ) return true;
    if( term instanceof IRNative ) return true;
    if( term instanceof IRHoisted ) return true;
    
    if( term instanceof IRLetted ) return _isClosedIRTerm( term.value, dbn );

    if( term instanceof IRForced ) return _isClosedIRTerm( term.forced, dbn );
    if( term instanceof IRDelayed ) return _isClosedIRTerm( term.delayed, dbn );

    // not even an IRTerm
    return false;
}

export function isClosedIRTerm( term: IRTerm ): boolean
{
    return _isClosedIRTerm( term, 0 );
}