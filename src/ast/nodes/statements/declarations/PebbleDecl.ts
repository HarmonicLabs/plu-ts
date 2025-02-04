import { FuncDecl } from "./FuncDecl";
import { StructDecl } from "./StructDecl";
import { isVarDecl, VarDecl } from "./VarDecl/VarDecl";

export type PebbleDecl
    = VarDecl
    | FuncDecl
    | StructDecl
    | EnumDecl
    | TypeAliasDecl
    ;

export function isPebbleDecl( thing: any ): thing is PebbleDecl
{
    return (
        isVarDecl( thing )
        || thing instanceof FuncDecl
        || thing instanceof StructDecl
        || thing instanceof EnumDecl
        || thing instanceof TypeAliasDecl
    );
}