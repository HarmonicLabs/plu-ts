import { IRTerm } from "../IRTerm";
import { _modifyChildFromTo } from "./_internal/_modifyChildFromTo";
import { _makeAllNegativeNativesHoisted } from "./_internal/_makeAllNegativeNativesHoisted";
import { handleLetted } from "./subRoutines/handleLetted";
import { handleHoistedAndReturnRoot } from "./subRoutines/handleHoistedAndReturnRoot";
import { replaceNativesAndReturnRoot } from "./subRoutines/replaceNatives";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { replaceClosedLettedWithHoisted } from "./subRoutines/replaceClosedLettedWithHoisted";
import { _irToUplc } from "./_internal/_irToUplc";
import { includesNode } from "./_internal/includesNode";
import type { UPLCTerm } from "@harmoniclabs/uplc";

export function compileIRToUPLC( term: IRTerm ): UPLCTerm
{
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

    // handle letted before hoisted because the three is smaller
    // and we also have less letted dependecies to handle
    handleLetted( term );

    term = handleHoistedAndReturnRoot( term );

    // replaced hoisted terms might include new letted terms
    while( includesNode( term, node => node instanceof IRLetted ) )
    {
        handleLetted( term );
    }

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------- translate to UPLC --------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    return _irToUplc( term );
}