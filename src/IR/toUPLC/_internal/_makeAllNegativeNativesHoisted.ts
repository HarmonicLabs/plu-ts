import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRNative } from "../../IRNodes/IRNative";
import { IRTerm } from "../../IRTerm";
import { _modifyChildFromTo } from "./_modifyChildFromTo";
import { iterTree } from "./iterTree";

export function _makeAllNegativeNativesHoisted( term: IRTerm ): void
{
    iterTree( term, elem => {
        if( elem instanceof IRNative && !(elem.parent instanceof IRHoisted) )
        {
            _modifyChildFromTo(
                elem.parent,
                elem,
                new IRHoisted( elem )
            );
            return true;
        }
    })
}