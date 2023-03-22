import { UPLCTerm, showUPLC } from "../../UPLC/UPLCTerm";
import { IRTerm } from "../IRTerm";
import { _modifyChildFromTo } from "./_internal/_modifyChildFromTo";
import { _addDepth } from "./_internal/_addDepth";
import { _makeAllNegativeNativesHoisted } from "./_internal/_makeAllNegativeNativesHoisted";
import { handleLetted } from "./subRoutines/handleLetted";
import { handleHoistedAndReturnRoot } from "./subRoutines/handleHoistedAndReturnRoot";
import { replaceNativesAndReturnRoot } from "./subRoutines/replaceNatives";
import { IRLetted } from "../IRNodes/IRLetted";
import { showIR } from "../utils/showIR";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { replaceClosedLettedWithHoisted } from "./subRoutines/replaceClosedLettedWithHoisted";

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

    handleLetted( term );

    term = handleHoistedAndReturnRoot( term );

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------- translate to UPLC --------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    return term.toUPLC(0);
}