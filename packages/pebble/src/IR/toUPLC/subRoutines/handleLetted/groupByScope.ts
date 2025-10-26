import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { LettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";

type ScopedLettedTerms = {
    maxScope: IRTerm | undefined, // undefined is any scope (root)
    group: LettedSetEntry[]
}

export function groupByScope( letteds: LettedSetEntry[] ): ScopedLettedTerms[]
{
    const scopes: ScopedLettedTerms[] = [];

    function pushScope( scope: IRTerm | undefined, letted: LettedSetEntry )
    {
        const scopeEntry = scopes.find( entry => entry.maxScope === scope );
        if( scopeEntry === undefined )
        {
            scopes.push({
                maxScope: scope,
                group: [letted]
            });
            return;
        }
        scopeEntry.group.push( letted );
    }

    for( const { letted, nReferences } of letteds )
    {
        const maxScope: IRTerm | undefined = getMaxScope( letted.value );
        pushScope( maxScope, { letted, nReferences } )
    }

    return scopes;
}

export function getMaxScope( term: IRTerm ): IRTerm | undefined // (undefined is root)
{
    const unbounded = getUnboundedVars( term );

    if( unbounded.size === 0 ) return undefined;

    while( term.parent )
    {
        term = term.parent;
        if( term instanceof IRDelayed ) return term;
        if(
            term instanceof IRFunc
            || term instanceof IRRecursive
        ) {
            for( const param of term.params )
            {
                if( unbounded.has( param ) ) return term;
            } 
        }
    }

    throw new Error("Unbounded var not found in any parent term");
}

export function getUnboundedIRVars( term: IRTerm ): (IRVar | IRSelfCall)[]
{
    const accessedVars = new Map<symbol, (IRVar | IRSelfCall)[]>();
    const boundedVars = new Set<symbol>();
    const stack: IRTerm[] = [ term ];

    while( stack.length > 0 )
    {
        const t = stack.pop()!;

        if(
            t instanceof IRVar
            || t instanceof IRSelfCall
        ) {
            let vars = accessedVars.get( t.name );
            if( !Array.isArray( vars ) ) {
                vars = [];
                accessedVars.set( t.name, vars );
            }
            vars.push( t );
            continue;
        }

        if(
            t instanceof IRFunc
            || t instanceof IRRecursive
        ) {
            for( const param of t.params ) boundedVars.add( param );
            stack.push( t.body );
            continue;
        }

        stack.push( ...t.children() );
    }

    for( const v of boundedVars ) accessedVars.delete( v );
    return [ ...accessedVars.values() ].flat();
}

export function getUnboundedVars( term: IRTerm, knownVars?: Set<symbol> | undefined ): Set<symbol>
{
    const accessedVars = new Set<symbol>();
    const boundedVars = new Set<symbol>();

    if( knownVars instanceof Set ) {
        for( const v of knownVars ) {
            if( typeof v === "symbol" ) boundedVars.add( v );
        }
    }

    const stack: IRTerm[] = [ term ];

    while( stack.length > 0 )
    {
        const t = stack.pop()!;

        if(
            t instanceof IRVar
            || t instanceof IRSelfCall
        ) {
            accessedVars.add( t.name );
            continue;
        }

        if(
            t instanceof IRFunc
            || t instanceof IRRecursive
        ) {
            for( const param of t.params ) boundedVars.add( param );
            stack.push( t.body );
            continue;
        }

        stack.push( ...t.children() );
    }

    for( const v of boundedVars ) accessedVars.delete( v );
    return accessedVars;
}