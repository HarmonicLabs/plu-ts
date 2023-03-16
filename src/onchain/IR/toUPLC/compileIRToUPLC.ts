import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { IRTerm } from "../IRTerm";
import { _modifyChildFromTo } from "./_internal/_modifyChildFromTo";
import { _addDepth } from "./_internal/_addDepth";
import { _makeAllNegativeNativesHoisted } from "./_internal/_makeAllNegativeNativesHoisted";
import { handleLetted } from "./subRoutines/handleLetted";
import { handleHoistedAndReturnRoot } from "./subRoutines/handleHoistedAndReturnRoot";
import { replaceNativesAndReturnRoot } from "./subRoutines/replaceNatives";
import { logJson } from "../../../utils/ts/ToJson";
import { IRLetted } from "../IRNodes/IRLetted";

export function compileIRToUPLC( term: IRTerm ): UPLCTerm
{   
    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------------- init  --------------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

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

    term = handleHoistedAndReturnRoot( term );

    // unwrap letted
    while( term instanceof IRLetted )
    {
        term = term.value;
        term.parent = undefined;
    }
    handleLetted( term )

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------- translate to UPLC --------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    logJson( term )
    return term.toUPLC();
}
