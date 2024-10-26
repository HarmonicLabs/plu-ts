import { IRFunc } from "../../IRNodes";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";
import { getChildren } from "../../tree_utils/getChildren";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { findAll } from "../_internal/findAll";
import { sanifyTree } from "./sanifyTree";


export function replaceHoistedWithLetted( term: IRTerm ): void
{
    const allHoisted: IRHoisted[] = findAll( term, node => node instanceof IRHoisted ) as IRHoisted[];
    
    for( const hoisted of allHoisted )
    {
        const parent = hoisted.parent!;
        const letted = new IRLetted(
            0x0fffffff, // doesn't matter since closed term
            hoisted.hoisted,
            { isClosed: true }
        );
        letted.hash; // precompute
        
        // replace hoisted with letted
        _modifyChildFromTo( parent, hoisted, letted );
    }

    // sanifyTree( term );
}