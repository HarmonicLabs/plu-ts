import type { UPLCTerm } from "@harmoniclabs/uplc";
import type { IRTerm } from "../IRTerm";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRConst } from "../IRNodes/IRConst";
import { _modifyChildFromTo } from "./_internal/_modifyChildFromTo";
import { _makeAllNegativeNativesHoisted } from "./_internal/_makeAllNegativeNativesHoisted";
import { _irToUplc } from "./_internal/_irToUplc";
import { includesNode } from "./_internal/includesNode";
import { handleLettedAndReturnRoot } from "./subRoutines/handleLetted";
import { handleHoistedAndReturnRoot } from "./subRoutines/handleHoistedAndReturnRoot";
import { replaceNativesAndReturnRoot } from "./subRoutines/replaceNatives";
import { replaceClosedLettedWithHoisted } from "./subRoutines/replaceClosedLettedWithHoisted";
import { hoistForcedNatives } from "./subRoutines/hoistForcedNatives";
import { handleRecursiveTerms, handleRootRecursiveTerm } from "./subRoutines/handleRecursiveTerms";
import { CompilerOptions, completeCompilerOptions, defaultOptions } from "./CompilerOptions";
import { replaceHoistedWithLetted } from "./subRoutines/replaceHoistedWithLetted";
import { IRApp, IRCase, IRConstr, IRNative, IRVar } from "../IRNodes";
import { replaceForcedNativesWithHoisted } from "./subRoutines/replaceForcedNativesWithHoisted";
import { performUplcOptimizationsAndReturnRoot } from "./subRoutines/performUplcOptimizationsAndReturnRoot";

export function compileIRToUPLC(
    term: IRTerm,
    paritalOptions: Partial<CompilerOptions> = defaultOptions
): UPLCTerm
{
    // most of the time we are just compiling small
    // pre-execuded terms (hence constants)
    if( term instanceof IRConst ) return _irToUplc( term ).term;

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------------- init  --------------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    const options = completeCompilerOptions( paritalOptions );

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

    // unwrap top level letted and hoisted;
    // some natives may be converted to hoisted;
    // this is really just an edge case
    while( term instanceof IRLetted || term instanceof IRHoisted )
    {
        // replace with value
        term = term instanceof IRLetted ? term.value : term.hoisted;

        // forget the parent; this is the new root
        term.parent = undefined;
    }
    
    if(
        term instanceof IRNative ||
        term instanceof IRConst // while we are at it
    ) return _irToUplc( term ).term;

    if( options.delayHoists ) replaceForcedNativesWithHoisted( term );

    if( options.delayHoists ) replaceHoistedWithLetted( term );
    else replaceClosedLettedWithHoisted( term );

    // handle letted before hoisted because the tree is smaller
    // and we also have less letted dependecies to handle
    term = handleLettedAndReturnRoot( term );
    
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
        term = handleLettedAndReturnRoot( term );
        term = handleHoistedAndReturnRoot( term );
    }

    ///////////////////////////////////////////////////////////////////////////////
    // ------------------------------------------------------------------------- //
    // --------------------------- translate to UPLC --------------------------- //
    // ------------------------------------------------------------------------- //
    ///////////////////////////////////////////////////////////////////////////////

    // introduces new hoisted terms
    // however we cannot do this before
    // because in order to hanlde letted at the best
    // we need to know where the `IRRecursive` nodes are
    term = handleRootRecursiveTerm( term );
    // if( options.delayHoists ) replaceHoistedWithLetted( term );

    // handle new hoisted terms
    term = handleHoistedAndReturnRoot( term )

    // strictly necessary to check the options
    // otherwise forced natives where already hoisted
    // will be re-hosited; causeing uselsess evaluations
    if( !options.delayHoists ) term = hoistForcedNatives( term );

    // at this point we expect the IR to be translable 1:1 to UPLC

    term = performUplcOptimizationsAndReturnRoot( term, options );

    if(
        options.addMarker &&
        options.targetUplcVersion.major >= 1 &&
        options.targetUplcVersion.minor >= 1 &&
        options.targetUplcVersion.patch >= 0
    )
    {
        term = new IRCase(
            new IRConstr( 0, [] ),
            [
                term,
                // never evaluated
                IRConst.int( 42 )
            ]
        );
    }

    const srcmap = {};
    const uplc = _irToUplc( term, srcmap ).term;

    // console.log( "srcmap", srcmap );

    return uplc;
}