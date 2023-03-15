import { IRNative } from "../../../IRNodes/IRNative";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { iterTree } from "../../_internal/iterTree";
import { nativeToIR } from "./nativeToIR";

export function replaceNatives( tree: IRTerm ): void
{
    iterTree( tree, elem => {
        if( elem instanceof IRNative )
        {
            _modifyChildFromTo(
                elem.parent,
                elem,
                nativeToIR( elem )
            );
        }
    });
}