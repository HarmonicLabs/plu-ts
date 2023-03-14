import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { IRTerm } from "../IRTerm";
import { _modifyChildFromTo } from "./_internal/_modifyChildFromTo";
import { _addDepth } from "./_internal/_addDepth";
import { _makeAllNegativeNativesHoisted } from "./_internal/_makeAllNegativeNativesHoisted";
import { handleLetted } from "./subRoutines/handleLetted";
import { handleHoistedAndReturnRoot } from "./subRoutines/handleHoistedAndReturnRoot";


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

    _makeAllNegativeNativesHoisted( term );


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

    term = handleHoistedAndReturnRoot( term );

    handleLetted( term )

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------- translate to UPLC --------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

}
