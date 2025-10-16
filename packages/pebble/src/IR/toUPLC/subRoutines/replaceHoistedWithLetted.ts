import { IRHash, irHashToHex } from "../../IRHash";
import { IRFunc } from "../../IRNodes";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";
import { getChildren } from "../../tree_utils/getChildren";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { findAll } from "../_internal/findAll";
import { sanifyTree } from "./sanifyTree";

const _hoisted_cache = new Map<IRHash, WeakRef<IRLetted>>();

export function replaceHoistedWithLetted( term: IRTerm ): void
{
    const allHoisted: IRHoisted[] = findAll( term, node => node instanceof IRHoisted ) as IRHoisted[];
    
    for( const hoisted of allHoisted )
    {
        const parent = hoisted.parent!;
        const cached = _hoisted_cache.get( hoisted.hash )?.deref();
        const letted = (
            cached ??
            new IRLetted(
                hoisted.name,
                hoisted.hoisted,
                { isClosed: true }
            )
        ).clone();
        if( !cached ) _hoisted_cache.set( hoisted.hash, new WeakRef( letted ) );
        
        // replace hoisted with letted
        _modifyChildFromTo( parent, hoisted, letted );
    }

    // sanifyTree( term );
}