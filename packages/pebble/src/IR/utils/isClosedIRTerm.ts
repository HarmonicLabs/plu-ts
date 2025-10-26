import { IRConst } from "../IRNodes/IRConst";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRTerm } from "../IRTerm";
import { IRApp } from "../IRNodes/IRApp";
import { IRError } from "../IRNodes/IRError";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRVar } from "../IRNodes/IRVar";
import { IRForced } from "../IRNodes/IRForced";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRConstr } from "../IRNodes/IRConstr";
import { IRCase } from "../IRNodes/IRCase";
import { IRRecursive } from "../IRNodes/IRRecursive";
import { IRSelfCall } from "../IRNodes/IRSelfCall";
import { IRNative } from "../IRNodes/IRNative";
import { getUnboundedIRVars, getUnboundedVars } from "../toUPLC/subRoutines/handleLetted/groupByScope";
import { prettyIRInline } from "./showIR";

function _isClosedIRTerm( term: IRTerm, boundedVars: Set<symbol>, parent?: IRTerm ): boolean
{
    if( term instanceof IRVar ) return boundedVars.has( term.name );
    if( term instanceof IRSelfCall ) return boundedVars.has( term.name );

    if( term instanceof IRFunc ) {
        boundedVars = new Set( boundedVars );
        for( const param of term.params ) boundedVars.add( param );
        return _isClosedIRTerm( term.body, boundedVars, term );
    }

    if( term instanceof IRRecursive ) {
        boundedVars = new Set( boundedVars );
        boundedVars.add( term.name );
        return _isClosedIRTerm( term.body, boundedVars, term );
    }

    if( term instanceof IRApp ) return _isClosedIRTerm( term.fn, boundedVars, term ) && _isClosedIRTerm( term.arg, boundedVars, term);
    if( term instanceof IRConstr ) return Array.from( term.fields ).every( f => _isClosedIRTerm( f, boundedVars, term ) );
    if( term instanceof IRCase ) return (
        _isClosedIRTerm( term.constrTerm, boundedVars, term )
        && Array.from( term.continuations )
        .every( cont => _isClosedIRTerm( cont, boundedVars, term ) )
    );
    
    if( term instanceof IRConst ) return true;
    if( term instanceof IRError ) return true;
    if( term instanceof IRNative ) return true;
    if( term instanceof IRHoisted ) return _isClosedIRTerm( term.hoisted, boundedVars, term );
    
    if( term instanceof IRLetted ) return _isClosedIRTerm( term.value, boundedVars, term );

    if( term instanceof IRForced ) return _isClosedIRTerm( term.forced, boundedVars, term );
    if( term instanceof IRDelayed ) return _isClosedIRTerm( term.delayed, boundedVars, term );

    const tsEnsureExhaustiveCheck: never = term;
    // not even an IRTerm
    console.error( parent )
    throw new Error(
        "`isClosedIRTerm` called on non-IR argument"
    );
}

export function isClosedIRTerm( term: IRTerm ): boolean
{
    return _isClosedIRTerm( term, new Set(), undefined );
}

export function _debug_assertClosedIR( term: IRTerm ): void
{
    if( !isClosedIRTerm( term ) ) {
        const unboundedVars = getUnboundedIRVars( term );
        console.error("unbounded vars:", unboundedVars.map( variab => variab.name ) );
        console.error("term:", prettyIRInline( term ) );
        console.error("unbounded parents:", unboundedVars.map( variab => prettyIRInline( variab.parent ?? variab ) ) );
        console.error("unbounded parents:", unboundedVars.map( variab => (variab as any)._creationStack ) );
        throw new Error("Term is not closed");
    }
}