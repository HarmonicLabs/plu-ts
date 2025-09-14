import { IRApp, IRConst, IRFunc, IRHoisted, IRLetted, IRNative } from "../../../IRNodes";
import { IRNativeTag } from "../../../IRNodes/IRNative/IRNativeTag";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _ir_apps } from "../../../tree_utils/_ir_apps";
import { prettyIR, prettyIRJsonStr } from "../../../utils";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { getApplicationTerms } from "../../utils/getApplicationTerms";
import { RemoveUnusedVarsCtx } from "./RemoveUnusedVarsCtx";

export function removeUnusedVarsAndReturnRoot( term: IRTerm ): IRTerm
{
    // we need to go bottom up
    // ONLY REMOVE UNUSED VARS IF NOT UNIT
    // (in which case we need to keep it for eventual side effects (asserts and traces))

    return _removeUnusedVars( term, RemoveUnusedVarsCtx.root( 0 ) );
}

function _removeUnusedVars( term: IRTerm, ctx: RemoveUnusedVarsCtx ): IRTerm
{
    if( term instanceof IRVar ) {
        // increment used
        ctx.incrementVarUse( term.dbn );
        return term;
    }

    const applicationTerms = getApplicationTerms( term );
    
    if( !applicationTerms )
    {
        const childrens = term.children();
        const nextCtx = term instanceof IRFunc
            ? ctx.newChild( term.arity )
            : ctx;
        for( const c of childrens ) {
            _removeUnusedVars( c, nextCtx );
        }
        return term;
    }

    const { func, args } = applicationTerms;

    if(!( func instanceof IRFunc )) {
        for( const child of term.children() ) {
            // same as parent ctx
            _removeUnusedVars( child, ctx );
        }
        return term;
    }

    const funcCtx = ctx.newChild( func.arity );
    func.body = _removeUnusedVars( func.body, funcCtx );

    // if all variables are used, keep as is
    if( !funcCtx.localVarsUseCount.some( u => u === 0 ) )
    {
        for( const funcArg of args ) {
            // arguments passed have the same context of the function called
            _removeUnusedVars( funcArg, ctx );
        }
        return term;
    }

    // +1 because adding 0 to baseDbn should point to the last arg of the function 
    const baseDbn = ctx.dbn + BigInt( 1 );
    const removedDbns: bigint[] = funcCtx.localVarsUseCount.slice().reverse()
        .map((varCount, idx) => varCount === 0 ? BigInt(idx) + baseDbn : undefined )
        .filter( dbnToRemove => typeof dbnToRemove === "bigint" ) as bigint[];

    // remove vars here
    func.arity -= removedDbns.length;
    const filteredArgs = args.filter(( _arg, idx ) => funcCtx.localVarsUseCount[ idx ] > 0 );
    funcCtx.forgetUnusedVars();

    const decrementedFuncBody = _decrementTermDbns( func.body, removedDbns );
    func.body = decrementedFuncBody;

    for( const funcArg of filteredArgs ) {
        // arguments passed have the same context of the function called
        _removeUnusedVars( funcArg, ctx );
    }

    const someArgsWereUsed = filteredArgs.length > 0;
    const newTerm = someArgsWereUsed
        ? _ir_apps( func, ...(filteredArgs as [IRTerm, ...IRTerm[]]) )
        : decrementedFuncBody;

    const parent = term.parent;
    if( parent ) _modifyChildFromTo( parent, term, newTerm );
    
    return newTerm;
}

function _getDbnDecrement( termDbn: number, removedDbns: bigint[] ): number
{
    return (
        removedDbns.filter( dbn => dbn < termDbn ).length
    );
}

function _decrementTermDbns( term: IRTerm, removedDbns: bigint[] ): IRTerm
{
    if( removedDbns.length <= 0 ) return term;

    if( term instanceof IRVar ) {
        const decrement = _getDbnDecrement( term.dbn, removedDbns );
        if( decrement > 0 ) {
            term.dbn -= decrement;
        }
        // _modifyChildFromTo( term.parent, term, term );
        return term;
    }
    if( term instanceof IRSelfCall ) {
        const decrement = _getDbnDecrement( term.dbn, removedDbns );
        if( decrement > 0 ) {
            term.dbn -= decrement;
        }
        // _modifyChildFromTo( term.parent, term, term );
        return term;
    }
    if( term instanceof IRLetted ) {
        const decrement = _getDbnDecrement( term.dbn, removedDbns );
        if( decrement > 0 ) {
            term.dbn -= decrement;
        }
        for( const c of term.children() ) {
            _decrementTermDbns( c, removedDbns );
        }
        return term;
    }
    if( term instanceof IRHoisted ) return term; // hoisted terms are closed

    for( const child of term.children() ) {
        _decrementTermDbns( child, removedDbns );
    }
    return term;
}