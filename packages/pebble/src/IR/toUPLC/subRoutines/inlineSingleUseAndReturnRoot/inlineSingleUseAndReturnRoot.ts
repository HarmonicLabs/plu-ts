/*
import { IRFunc, IRHoisted, IRLetted } from "../../../IRNodes";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { getApplicationTerms } from "../../utils/getApplicationTerms";
import { InlineSingleUseCtx } from "./InlineSingleUseCtx";

export interface InlineSingleResult {
    term: IRTerm;
    somethingWasInlined: boolean;
}

// DOES NOT WORK AS IS
// TODO: FIND BUG (use onlySpend contract)
export function inlineSingleUseAndReturnRoot( term: IRTerm ): InlineSingleResult
{
    // we need to go bottom up
    // ONLY REMOVE UNUSED VARS IF NOT UNIT
    // (in which case we need to keep it for eventual side effects (asserts and traces))

    return _inlineSingleUse( term, InlineSingleUseCtx.root( 0 ) );
}

// DOES NOT WORK AS IS
// TODO: FIND BUG (use onlySpend contract)
function _inlineSingleUse( term: IRTerm, ctx: InlineSingleUseCtx ): InlineSingleResult
{
    let somethingWasInlined = false;
    
    if( term instanceof IRVar ) {
        // increment used
        ctx.incrementVarUse( term.dbn );
        return { term: term, somethingWasInlined: false };
    }

    const applicationTerms = getApplicationTerms( term );
    
    if( !applicationTerms )
    {
        const childrens = term.children();
        const nextCtx = term instanceof IRFunc
            ? ctx.newChild( term.arity )
            : ctx;
        for( const c of childrens ) {
            const inlineResult = _inlineSingleUse( c, nextCtx );
            somethingWasInlined ||= inlineResult.somethingWasInlined;
        }
        return { term, somethingWasInlined };
    }

    const { func, args } = applicationTerms;

    if(!( func instanceof IRFunc )) {
        for( const child of term.children() ) {
            // same as parent ctx
            const inlineResult = _inlineSingleUse( child, ctx );
            somethingWasInlined ||= inlineResult.somethingWasInlined;
        }
        return { term, somethingWasInlined };
    }

    const funcCtx = ctx.newChild( func.arity );
    const inlineResult = _inlineSingleUse( func.body, funcCtx );
    func.body = inlineResult.term;
    somethingWasInlined ||= inlineResult.somethingWasInlined;

    // if all variables are either not used at all, or used more than once, keep as is
    if( !funcCtx.localVarsUseCount.some( nUses => nUses === 1 ) )
    {
        for( const funcArg of args ) {
            // arguments passed have the same context of the function called
            const inlineResult = _inlineSingleUse( funcArg, ctx );
            somethingWasInlined ||= inlineResult.somethingWasInlined;
        }
        return { term, somethingWasInlined };
    }

    // if we get here, at least one variable is used exactly once
    somethingWasInlined = true;

    // removed dbns are relative indices (0-based) of the function parameters
    const removedDbns: bigint[] = funcCtx.localVarsUseCount
        .map( (varCount, idx) => varCount === 1 ? BigInt(idx) : undefined )
        .filter( (v): v is bigint => typeof v === "bigint" );
    
    // remove vars here
    const inlinedTerms: { [dbn: number]: IRTerm } = {};
    const remainingArgs: IRTerm[] = [];
    args.forEach( ( arg, idx ) => {
        const nUses = funcCtx.localVarsUseCount[ idx ];
        if( nUses === 1 ) {
            // map using relative parameter index
            inlinedTerms[ idx ] = arg;
        } else remainingArgs.push( arg );
    } );

    func.arity -= removedDbns.length;
    const decrementedFuncBody = _decrementAndInline(
        func.body,
        removedDbns,
        inlinedTerms,
        0
    );
    func.body = decrementedFuncBody;

    for( const funcArg of remainingArgs ) {
        // arguments passed have the same context of the function called
        _inlineSingleUse( funcArg, ctx );
    }

    const someArgsWereUsed = remainingArgs.length > 0;
    const newTerm = someArgsWereUsed
        ? _ir_apps( func, ...(remainingArgs as [IRTerm, ...IRTerm[]]) )
        : decrementedFuncBody;

    const parent = term.parent;
    if( parent ) _modifyChildFromTo( parent, term, newTerm );
    
    return { term: newTerm, somethingWasInlined };
}

function _getDbnDecrement( termDbn: number, removedDbns: bigint[], paramOffset: number ): number
{
    // termDbn is absolute inside current function. removedDbns are relative indices (0..arity-1)
    // A variable corresponds to a parameter if termDbn - paramOffset is within removed list
    const rel = termDbn - paramOffset;
    if( rel < 0 ) return 0;
    // number of removed parameters with index < rel
    return removedDbns.filter( dbn => Number(dbn) < rel ).length;
}

function _decrementAndInline(
    term: IRTerm,
    removedDbns: bigint[],
    inlineDbns: { [dbn: number]: IRTerm },
    paramOffset: number // absolute dbn of parameter 0 for current function scope
): IRTerm
{
    if( removedDbns.length <= 0 ) return term;

    if( term instanceof IRVar ) {
        const relIdx = term.dbn - paramOffset;
        if( relIdx >= 0 ) {
            let inlineTerm = inlineDbns[ relIdx ];
            if( inlineTerm ) {
                // clone to avoid sharing and adjust dbns relative to current paramOffset
                inlineTerm = inlineTerm.clone();
                inlineTerm = _incrementTermDbns( inlineTerm, paramOffset );
                if( term.parent ) _modifyChildFromTo( term.parent, term, inlineTerm );
                return inlineTerm;
            }
            const decrement = _getDbnDecrement( term.dbn, removedDbns, paramOffset );
            if( decrement > 0 ) term.dbn -= decrement;
        }
        return term;
    }
    if( term instanceof IRSelfCall ) {
        const decrement = _getDbnDecrement( term.dbn, removedDbns, paramOffset );
        if( decrement > 0 ) term.dbn -= decrement;
        return term;
    }
    if( term instanceof IRLetted ) {
        const decrement = _getDbnDecrement( term.dbn, removedDbns, paramOffset );
        if( decrement > 0 ) term.dbn -= decrement;
        for( const child of term.children() ) {
            _decrementAndInline( child, removedDbns, inlineDbns, paramOffset );
        }
        return term;
    }
    if( term instanceof IRHoisted ) return term; // closed

    if( term instanceof IRFunc ) {
        // entering new function: its parameters start at current paramOffset
        // increment paramOffset by its arity for body children
        for( const child of term.children() ) {
            _decrementAndInline( child, removedDbns, inlineDbns, paramOffset + term.arity );
        }
        return term;
    }

    for( const child of term.children() ) {
        _decrementAndInline( child, removedDbns, inlineDbns, paramOffset );
    }
    return term;
}

function _incrementTermDbns( term: IRTerm, dbnDiff: number ): IRTerm
{
    if( dbnDiff === 0 ) return term;

    if( term instanceof IRVar ) {
        term.dbn += dbnDiff;
        // _modifyChildFromTo( term.parent, term, term );
        return term;
    }
    if( term instanceof IRSelfCall ) {
        term.dbn += dbnDiff;
        // _modifyChildFromTo( term.parent, term, term );
        return term;
    }
    if( term instanceof IRLetted ) {
        term.dbn += dbnDiff;
        for( const c of term.children() ) {
            _incrementTermDbns( c, dbnDiff );
        }
        return term;
    }
    if( term instanceof IRHoisted ) return term; // hoisted terms are closed

    for( const child of term.children() ) {
        _incrementTermDbns( child, dbnDiff );
    }
    return term;
}
//*/