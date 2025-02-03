import { ArrayLikeDeconstr } from "./ArrayLikeDeconstr";
import { NamedDeconstructVarDecl } from "./NamedDeconstructVarDecl";
import { SimpleVarDecl } from "./SimpleVarDecl";
import { SingleDeconstructVarDecl } from "./SingleDeconstructVarDecl";

export type DeconstructVarDecl
    = NamedDeconstructVarDecl // ConstrName{ ... }
    | SingleDeconstructVarDecl // { ... }
    | ArrayLikeDeconstr; // [ ... ]

export function isDeconstructVarDecl( node: any ): node is DeconstructVarDecl
{
    return (
        node instanceof NamedDeconstructVarDecl     ||
        node instanceof SingleDeconstructVarDecl    ||
        node instanceof ArrayLikeDeconstr
    );
}

export type VarDecl
    = SimpleVarDecl
    | DeconstructVarDecl

export function isVarDecl( node: any ): node is VarDecl
{
    return (
        node instanceof SimpleVarDecl ||
        isDeconstructVarDecl( node )
    );
}