import { IRHoisted } from "../../IRNodes/IRHoisted";
import { isForcedNative } from "../../IRNodes/IRNative/isForcedNative";
import { IRTerm } from "../../IRTerm";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { iterTree } from "../_internal/iterTree";

export function replaceForcedNativesWithHoisted( term: IRTerm ): void
{
    iterTree( term, ( node, _dbn ) => {
        if( isForcedNative( node ) )
        {
            _modifyChildFromTo(
                node.parent,
                node,
                new IRHoisted( node )
            );
        }
    });
}