import type { UPLCTerm } from "@harmoniclabs/uplc";
import type { IRTerm } from "../IRTerm";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRConst } from "../IRNodes/IRConst";
import { _modifyChildFromTo } from "./_internal/_modifyChildFromTo";
import { _makeAllNegativeNativesHoisted } from "./_internal/_makeAllNegativeNativesHoisted";
import { _irToUplc } from "./_internal/_irToUplc";
import { includesNode } from "./_internal/includesNode";
import { handleLetted } from "./subRoutines/handleLetted";
import { handleHoistedAndReturnRoot } from "./subRoutines/handleHoistedAndReturnRoot";
import { replaceNativesAndReturnRoot } from "./subRoutines/replaceNatives";
import { replaceClosedLettedWithHoisted } from "./subRoutines/replaceClosedLettedWithHoisted";
import { prettyIR } from "../utils";

export function compileIRToUPLC( term: IRTerm ): UPLCTerm
{
    // most of the time we are just compiling small
    // pre-execuded terms (hence constants)
    if( term instanceof IRConst ) return _irToUplc( term ).term;
    
    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------------- init  --------------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    // unwrap top level letted and hoisted;
    while( term instanceof IRLetted || term instanceof IRHoisted )
    {
        // replace with value
        term = term instanceof IRLetted ? term.value : term.hoisted;

        // forget the parent; this is the new root
        term.parent = undefined;
    }

    // _makeAllNegativeNativesHoisted( term );


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

    term = replaceNativesAndReturnRoot( term );

    replaceClosedLettedWithHoisted( term );

    // handle letted before hoisted because the tree is smaller
    // and we also have less letted dependecies to handle
    handleLetted( term );
    
    term = handleHoistedAndReturnRoot( term );

    // replaced hoisted terms might include new letted terms
    while(
        includesNode(
        term,
        node => 
            node instanceof IRLetted || 
            node instanceof IRHoisted
        )
    )
    {
        handleLetted( term );
        term = handleHoistedAndReturnRoot( term );
    }

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------- translate to UPLC --------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    const srcmap = {};
    const uplc = _irToUplc( term, srcmap ).term;

    // console.log( "srcmap", srcmap );

    return uplc;
}