import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";
import { VarDecl } from "./declarations/VarDecl/VarDecl";

export type AtLeastOneDecl = [ VarDecl, ...VarDecl[] ];

export class VarStmt<Decls extends AtLeastOneDecl = AtLeastOneDecl>
    implements HasSourceRange
{
    constructor(
        readonly declarations: Decls,
        readonly range: SourceRange
    ) {}
}

export function isVarStmt( node: any ): node is VarStmt
{
    return node instanceof VarStmt;
}