import { IRNative } from "../../../IRNodes/IRNative";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { iterTree } from "../../_internal/iterTree";
import { nativeToIR } from "./nativeToIR";

export function replaceNativesAndReturnRoot( tree: IRTerm ): IRTerm
{
    if( tree instanceof IRNative )
    {
        return nativeToIR( tree );
    }

    iterTree( tree, elem => {
        if( elem instanceof IRNative && elem.tag < 0 )
        {
            _modifyChildFromTo(
                elem.parent,
                elem,
                nativeToIR( elem )
            );
            return true;
        }
    });
    return tree;
}