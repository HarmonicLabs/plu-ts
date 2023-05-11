import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRTerm } from "../../IRTerm";
import { isClosedIRTerm } from "../../utils/isClosedIRTerm";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { iterTree } from "../_internal/iterTree";

export function replaceClosedLettedWithHoisted( root: IRTerm )
{
    iterTree( root, (node) => {
        if( node instanceof IRLetted && isClosedIRTerm( node.value ) )
        {
            _modifyChildFromTo(
                node.parent,
                node,
                new IRHoisted(
                    node.value,
                    node.meta
                )
            );
            return true;
        }
    });
}