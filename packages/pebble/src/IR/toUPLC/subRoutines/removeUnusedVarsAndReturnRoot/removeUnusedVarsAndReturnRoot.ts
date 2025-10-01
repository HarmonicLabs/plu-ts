import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { getApplicationTerms } from "../../utils/getApplicationTerms";

// Removed inline metadata; use external WeakMap to preserve object shapes.
const removedParams = new WeakMap<IRFunc, boolean[]>();

export function removeUnusedVarsAndReturnRoot( term: IRTerm ): IRTerm {
    const maxIterations = 3;
    let nIterations = 0;
    while(
        nIterations++ < maxIterations &&
        hasUnusedParam( term )
    ) {
        passRemove( term );
        term = passRebuildApps( term );
        // metadata entries will naturally be GC'ed after rebuild deletes them
    }
    term = passRebuildApps( term );
    return term;
}

function hasUnusedParam( node: IRTerm ): boolean {
    if( node instanceof IRFunc && node.arity > 0 ) {
        const A = node.arity;
        const counts = new Array<number>( A ).fill(0);
        scanUsages( node.body, [A], counts );
        if( counts.some( c => c === 0 ) ) return true;
    }
    if( node instanceof IRHoisted ) return false;
    const ch = node.children?.() || [];
    for( const c of ch ) if( hasUnusedParam( c ) ) return true;
    return false;
}

function passRemove( node: IRTerm ): void {
    if( node instanceof IRFunc ) { processFunc( node ); return; }
    // if( node instanceof IRHoisted ) return;
    const ch = node.children?.() || [];
    for( const c of ch ) passRemove( c );
}

function processFunc( fn: IRFunc ): void {
    const A = fn.arity;
    if( A > 0 ) {
        const counts = new Array<number>( A ).fill(0);
        scanUsages( fn.body, [A], counts );
        if( counts.some( c => c === 0 ) ) {
            const removed: number[] = []; const flags: boolean[] = new Array(A).fill(false);
            for( let i=0;i<A;i++ ) if( counts[i] === 0 ) { removed.push(i); flags[i] = true; }
            reindexAfterRemoval( fn.body, removed, A, 0 );
            fn.arity = A - removed.length;
            removedParams.set( fn, flags );
        }
    }
    visitNested( fn.body );
}

function visitNested( t: IRTerm ): void {
    if( t instanceof IRFunc ) { processFunc( t ); return; }
    if( t instanceof IRHoisted ) return;
    const ch = t.children?.() || [];
    for( const c of ch ) visitNested( c );
}

function scanUsages( t: IRTerm, stack: number[], counts: number[] ): void {
    if( t instanceof IRVar || t instanceof IRSelfCall ) {
        const k = (t as IRVar | IRSelfCall).dbn;
        let cum = 0;
        for( let level = stack.length - 1; level >= 0; level-- ) {
            const ar = stack[level];
            if( k < cum + ar ) {
                if( level === 0 ) counts[ k - cum ]++;
                return;
            }
            cum += ar;
        }
        return;
    }
    if( t instanceof IRFunc ) { stack.push( t.arity ); scanUsages( t.body, stack, counts ); stack.pop(); return; }
    if( t instanceof IRHoisted ) return;
    if( t instanceof IRApp ) { scanUsages( t.fn, stack, counts ); scanUsages( t.arg, stack, counts ); return; }
    const ch = t.children?.();
    if( ch ) for( const c of ch ) scanUsages( c, stack, counts );
}

function reindexAfterRemoval( t: IRTerm, removed: number[], originalArity: number, depthShift: number ): void {
    if( removed.length === 0 ) return;
    function adjust(k: number): number {
        if( k < depthShift ) return k;
        const rel = k - depthShift;
        if( rel < originalArity ) {
            let removedBefore = 0;
            for( const r of removed ) { if( r === rel ) throw new Error("reference to removed parameter"); if( r < rel ) removedBefore++; }
            return k - removedBefore;
        }
        return k - removed.length;
    }
    if( t instanceof IRVar ) { t.dbn = adjust(t.dbn); return; }
    if( t instanceof IRSelfCall ) { t.dbn = adjust(t.dbn); return; }
    if( t instanceof IRFunc ) { reindexAfterRemoval( t.body, removed, originalArity, depthShift + t.arity ); return; }
    if( t instanceof IRHoisted ) return;
    if( t instanceof IRApp ) {
        reindexAfterRemoval( t.fn, removed, originalArity, depthShift ); 
        reindexAfterRemoval( t.arg, removed, originalArity, depthShift );
        return;
    }
    const ch = t.children?.();
    if( ch ) for( const c of ch ) reindexAfterRemoval( c, removed, originalArity, depthShift );
}

function passRebuildApps( root: IRTerm ): IRTerm {
    function rebuild(t: IRTerm): IRTerm {
        if( t instanceof IRApp ) {
            const args: IRTerm[] = []; let head: IRTerm = t;
            while( head instanceof IRApp ) { args.push( head.arg ); head = head.fn; }
            args.reverse();
            head = rebuild( head );
            for( let i=0;i<args.length;i++ ) args[i] = rebuild( args[i] );
            if( head instanceof IRFunc ) {
                const flags = removedParams.get( head );
                if( flags ) {
                    const kept: IRTerm[] = [];
                    for( let i=0;i<flags.length && i<args.length;i++ ) if( !flags[i] ) kept.push( args[i] );
                    let acc: IRTerm = head;
                    for( const a of kept ) acc = new IRApp( acc as any, a as any );
                    removedParams.delete( head );
                    return acc;
                }
            }
            let chain: IRTerm = head;
            for( const a of args ) chain = new IRApp( chain as any, a as any );
            return chain;
        }
        if( t instanceof IRFunc ) { t.body = rebuild( t.body ); return t; }
        if( t instanceof IRVar || t instanceof IRSelfCall || t instanceof IRHoisted ) return t;
        const ch = t.children?.(); if( ch ) for( const c of ch ) rebuild( c );
        return t;
    }
    return rebuild( root );
}