import { EnumDecl } from "./EnumDecl";
import { StructDecl } from "./StructDecl";
import { TypeAliasDecl } from "./TypeAliasDecl";

export type PebbleAstTypeDecl
    = StructDecl
    | EnumDecl
    | TypeAliasDecl
    ;

export function isPebbleAstTypeDecl( thing: any ): thing is PebbleAstTypeDecl
{
    return (
        thing instanceof StructDecl
        || thing instanceof EnumDecl
        || thing instanceof TypeAliasDecl
    );
}