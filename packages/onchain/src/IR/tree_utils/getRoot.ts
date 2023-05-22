import { IRTerm } from "../IRTerm";

export function getRoot( node: IRTerm ): IRTerm
{
    let root = node;
    while( root.parent ) root = root.parent;
    return root;
}