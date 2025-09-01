import { EnumDecl } from "./EnumDecl";
import { StructDecl } from "./StructDecl";
import { TypeAliasDecl } from "./TypeAliasDecl";

export type PebbleTypeDecl
    = StructDecl
    | EnumDecl
    | TypeAliasDecl
    ;

export function isPebbleTypeDecl( thing: any ): thing is PebbleTypeDecl
{
    return (
        thing instanceof StructDecl
        || thing instanceof EnumDecl
        || thing instanceof TypeAliasDecl
    );
}