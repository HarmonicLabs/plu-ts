import { BasePlutsError } from "../../../errors/BasePlutsError";
import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { IRApp } from "../IRNodes/IRApp";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRHoisted, getHoistedTerms, getSortedHoistedSet } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRNative } from "../IRNodes/IRNative";
import { IRTerm } from "../IRTerm";


/*

Glossary:

LCA -> Lowest Common Ancestor

LCA definition: the lowest node in the tree that has both nodes as descendants

Finding LCA becomes easy when parent pointer is given as we can easily find all ancestors of a node using parent pointer. Below are steps to find LCA.

*/

export function compileIRToUPLC( term: IRTerm ): UPLCTerm
{
    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------------- init  --------------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    _makeAllNegativeNativesHoistedAndAddDepth( term );


    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // ----------------------------- optimizations ----------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    // --------------------------- optimize natives  --------------------------- //

    // at constant -> head and tails
    

    // --------------------- optimize recursive functions  --------------------- //
    
    // avoid passing whole structs

    // take letted terms outside


    // ----------------------- optimize normal functions ----------------------- //

    // avoid passing whole structs

    // reorganize function arguments to take advantage of partial applicaiton


    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // ------------------------------ final steps ------------------------------ //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    const allHoisteds = getSortedHoistedSet( getHoistedTerms( term ) );
    let n = allHoisteds.length;
    let n2 = 0;
    const hoisteds = new Array( n );

    for( let i = 0; i < n; i++ )
    {
        const thisHoistedEntry = allHoisteds[i];
        if( thisHoistedEntry.nReferences === 1 )
        {
            if( thisHoistedEntry.hoisted.parent )
            {
                // inline hoisted with single reference
                _modifyChildFromTo(
                    thisHoistedEntry.hoisted.parent,
                    thisHoistedEntry.hoisted,
                    thisHoistedEntry.hoisted.hoisted
                )
            }
        }
        else
        {
            hoisteds[ n2++ ] = thisHoistedEntry.hoisted;
        }
    }

    // drop unused space
    hoisteds.length = n2;


}

/**
 * 
 * @param parent node to modify the child of
 * @param currentChild mainly passed to distinguish in case of `IRApp`
 * @param newChild new node's child
 */
function _modifyChildFromTo( parent: IRTerm, currentChild: IRTerm, newChild: IRTerm ): void
{
    if( parent instanceof IRApp )
    {
        if( parent.fn === parent.arg )
        throw new BasePlutsError(
            "while calling '_modifyChildFromTo' on a 'IRApp' node; teh two childrens where the same"
        );

        if( parent.fn === currentChild )
        {
            parent.fn = newChild;
        }
        else
        {
            parent.arg = newChild;
        }
        return;
    }

    if( parent instanceof IRDelayed )
    {
        parent.delayed = newChild;
        return;
    }

    if( parent instanceof IRForced )
    {
        parent.forced = newChild;
        return;
    }

    if( parent instanceof IRFunc )
    {
        parent.body = newChild;
        return;
    }

    if( parent instanceof IRHoisted )
    {
        parent.hoisted = newChild;
        return;
    }

    if( parent instanceof IRLetted )
    {
        parent.value = newChild;
        return;
    }
}

function _makeAllNegativeNativesHoistedAndAddDepth( _term: IRTerm ): void
{
    type StackElem = IRTerm & { depth: number };

    function defineDepth( term: IRTerm, depth: number ): StackElem
    {
        return Object.defineProperty(
            term, "depth", {
                value: depth,
                writable: true,
                enumerable: true,
                configurable:false
            }
        ) as any;
    }

    const stack: StackElem[] = [defineDepth( _term, 0 )];

    while( stack.length > 0 )
    {
        const t = stack.pop() as StackElem;
        
        if( t instanceof IRApp )
        {
            stack.push(
                defineDepth( t.fn , t.depth + 1), 
                defineDepth( t.arg, t.depth + 1)
            );
        }

        if( t instanceof IRDelayed )
        {
            stack.push( defineDepth( t.delayed, t.depth + 1 ) )
        }

        if( t instanceof IRForced )
        {
            stack.push( defineDepth( t.forced, t.depth + 1 ) )
        }

        if( t instanceof IRFunc )
        {
            stack.push( defineDepth( t.body, t.depth + 1 ) )
        }
        
        if( t instanceof IRHoisted )
        {
            // 0 because hoisted are closed
            // for hoisted we keep track of the depth inside the term
            stack.push( defineDepth( t.hoisted, 0 ) );
        }

        if( t instanceof IRLetted )
        {
            // same stuff as the hoisted terms
            // the only difference is that depth is then incremented
            // once the letted term reaches its final position
            stack.push( defineDepth( t.value, 0 ) );
        }

        if( t instanceof IRNative )
        {
            if( !(t.parent instanceof IRHoisted) && t.parent )
            {
                _modifyChildFromTo(
                    t.parent, 
                    t, 
                    defineDepth( 
                        new IRHoisted( t ), 
                        t.depth++ // pass current depth and increment own 
                    ) 
                )
            }
        }
    }
}