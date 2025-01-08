import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRTerm } from "../../../IRTerm";
import { IRApp, IRNative } from "../../../IRNodes";
import { IRNativeTag } from "../../../IRNodes/IRNative/IRNativeTag";

export type RecursiveIRNode = IRRecursive | IRApp;

export function findHighestRecursiveParent( term: IRTerm, maxScope: IRTerm ): RecursiveIRNode | undefined
{
    let highest: RecursiveIRNode | undefined = undefined;
    while(
        term.parent !== maxScope &&
        term.parent !== undefined
    )
    {
        if( isRecursiveNode( term ) ) highest = term;
        term = term.parent;
    }
    return highest;
}

function isRecursiveNode( term: IRTerm ): term is RecursiveIRNode
{
    return (
        term instanceof IRRecursive ||
        (
            term instanceof IRApp &&
            term.fn instanceof IRNative &&
            term.fn.tag === IRNativeTag.z_comb 
        )
    );
}